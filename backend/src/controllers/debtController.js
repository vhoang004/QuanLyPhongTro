const {
  Contract, Room, Tenant, Invoice, Payment, InvoiceDetail, Service, Adjustment
} = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse } = require("../services/helpers");

const getAllDebts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, billing_month, room_id, search } = req.query;

    const where = {};
    if (status === "paid") {
      where.status = "paid";
    } else if (status === "unpaid") {
      where.status = { [Op.in]: ["unpaid"] };
    } else if (status === "partial") {
      where.status = { [Op.in]: ["partial"] };
    }
    if (billing_month) where.billing_month = billing_month;

    let contractWhere = {};
    if (room_id) contractWhere.room_id = room_id;

    if (search) {
      const rooms = await Room.findAll({
        where: { [Op.or]: [
          { room_number: { [Op.like]: `%${search}%` } },
          { room_name: { [Op.like]: `%${search}%` } }
        ]},
        attributes: ["id"],
      });
      const roomIds = rooms.map((r) => r.id);
      if (roomIds.length > 0) {
        contractWhere = { ...contractWhere, room_id: { [Op.in]: roomIds } };
      } else {
        const tenants = await Tenant.findAll({
          where: { [Op.or]: [
            { full_name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ]},
          attributes: ["id"],
        });
        const tenantIds = tenants.map((t) => t.id);
        if (tenantIds.length > 0) {
          contractWhere = { ...contractWhere, tenant_id: { [Op.in]: tenantIds } };
        }
      }
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      distinct: true,
      include: [
        {
          model: Contract,
          as: "contract",
          where: Object.keys(contractWhere).length ? contractWhere : undefined,
          required: Object.keys(contractWhere).length > 0,
          include: [
            { model: Room, as: "room" },
            { model: Tenant, as: "tenant" },
          ],
        },
      ],
      order: [["billing_month", "DESC"], ["created_at", "DESC"]],
      ...paginateQuery({ page, limit }),
    });

    // Fix N+1: batch load all payments in ONE query instead of N queries
    const invoiceIds = rows.map(i => i.id);
    const allPayments = invoiceIds.length > 0
      ? await Payment.findAll({ where: { invoice_id: { [Op.in]: invoiceIds } } })
      : [];
    const paymentsMap = {};
    for (const p of allPayments) {
      (paymentsMap[p.invoice_id] ||= []).push(p);
    }

    const invoicesWithPaid = rows.map(invoice => {
      const payments = paymentsMap[invoice.id] || [];
      const paidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        ...invoice.toJSON(),
        paid_amount: paidAmount,
        remaining_debt: parseFloat(invoice.total_amount) - paidAmount,
      };
    });

    return res.json(buildPaginationResponse(invoicesWithPaid, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getDebtSummary = async (req, res, next) => {
  try {
    const { billing_month } = req.query;

    const where = billing_month ? { billing_month } : {};
    const allInvoices = await Invoice.findAll({
      where,
      include: [{ model: Payment, as: "payments", required: false }],
    });

    let totalMustPay = 0;
    let totalPaid = 0;
    let totalDebt = 0;
    let unpaidCount = 0;

    for (const invoice of allInvoices) {
      const invTotal = parseFloat(invoice.total_amount);
      const paidAmount = invoice.payments
        ? invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
        : 0;
      const remaining = invTotal - paidAmount;
      totalMustPay += invTotal;
      totalPaid += paidAmount;
      if (invoice.status !== "paid") {
        unpaidCount++;
        totalDebt += remaining;
      }
    }

    return res.json({
      total_must_pay: totalMustPay,
      total_paid: totalPaid,
      total_debt: totalDebt,
      unpaid_count: unpaidCount,
      total_invoices: allInvoices.length,
    });
  } catch (error) {
    next(error);
  }
};

const getDebtDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Contract,
          as: "contract",
          include: [
            { model: Room, as: "room" },
            { model: Tenant, as: "tenant" },
          ],
        },
        {
          model: InvoiceDetail,
          as: "details",
          include: [{ model: Service, as: "service" }],
        },
        { model: Payment, as: "payments", required: false },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
    }

    const adjustments = await Adjustment.findAll({
      where: { contract_id: invoice.contract_id, billing_month: invoice.billing_month },
    });

    const paidAmount = invoice.payments
      ? invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
      : 0;

    return res.json({
      invoice: {
        ...invoice.toJSON(),
        paid_amount: paidAmount,
        remaining_debt: parseFloat(invoice.total_amount) - paidAmount,
      },
      adjustments,
    });
  } catch (error) {
    next(error);
  }
};

const createAdjustment = async (req, res, next) => {
  try {
    const { contract_id, billing_month, type, description, amount } = req.body;

    if (!contract_id || !billing_month || !type || !amount) {
      return res.status(400).json({ message: "Các trường bắt buộc: contract_id, billing_month, type, amount." });
    }

    if (!["surcharge", "discount"].includes(type)) {
      return res.status(400).json({ message: "Type phải là 'surcharge' hoặc 'discount'." });
    }

    const contract = await Contract.findByPk(contract_id);
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    }

    const adjustment = await Adjustment.create({
      contract_id,
      billing_month,
      type,
      description: description || "",
      amount: parseFloat(amount),
    });

    // Update invoice total if exists
    const invoice = await Invoice.findOne({ where: { contract_id, billing_month } });
    if (invoice) {
      const allAdjustments = await Adjustment.findAll({
        where: { contract_id, billing_month },
      });
      let adjAmt = 0;
      for (const adj of allAdjustments) {
        adjAmt += adj.type === "surcharge" ? parseFloat(adj.amount) : -parseFloat(adj.amount);
      }
      invoice.adjustment_amount = parseFloat(adjAmt.toFixed(2));
      invoice.total_amount = parseFloat((
        parseFloat(invoice.room_price) +
        parseFloat(invoice.electricity_amount) +
        parseFloat(invoice.water_amount) +
        parseFloat(invoice.total_service_price) +
        adjAmt
      ).toFixed(2));
      await invoice.save();
    }

      return res.status(201).json({ message: "Tạo điều chỉnh thành công.", adjustment });
  } catch (error) {
    next(error);
  }
};

const deleteAdjustment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const adjustment = await Adjustment.findByPk(id);
    if (!adjustment) {
      return res.status(404).json({ message: "Không tìm thấy điều chỉnh." });
    }

    const { contract_id, billing_month } = adjustment;

    await adjustment.destroy();

    // Update invoice total
    const invoice = await Invoice.findOne({ where: { contract_id, billing_month } });
    if (invoice) {
      const allAdjustments = await Adjustment.findAll({
        where: { contract_id, billing_month },
      });
      let adjAmt = 0;
      for (const adj of allAdjustments) {
        adjAmt += adj.type === "surcharge" ? parseFloat(adj.amount) : -parseFloat(adj.amount);
      }
      invoice.adjustment_amount = parseFloat(adjAmt.toFixed(2));
      invoice.total_amount = parseFloat((
        parseFloat(invoice.room_price) +
        parseFloat(invoice.electricity_amount) +
        parseFloat(invoice.water_amount) +
        parseFloat(invoice.total_service_price) +
        adjAmt
      ).toFixed(2));
      await invoice.save();
    }

      return res.json({ message: "Xóa điều chỉnh thành công." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDebts,
  getDebtSummary,
  getDebtDetails,
  createAdjustment,
  deleteAdjustment,
};
