const { Room, Contract, Tenant, Invoice, InvoiceDetail, Payment, Service, MeterReading } = require("../models");
const { Op } = require("sequelize");
const { formatMonth, getStartOfMonth, getEndOfMonth } = require("../services/helpers");
const { generateInvoicePDF } = require("../services/pdfService");
const { sendInvoiceEmail, buildInvoiceEmailHtml } = require("../services/emailService");

const getDashboard = async (req, res, next) => {
  try {
    const totalRooms = await Room.count();
    const availableRooms = await Room.count({ where: { status: "available" } });
    const rentedRooms = await Room.count({ where: { status: "rented" } });
    const maintenanceRooms = await Room.count({ where: { status: "maintenance" } });

    const totalTenants = await Tenant.count();
    const activeContracts = await Contract.count({ where: { status: "active" } });

    const totalRevenueResult = await Payment.findAll({
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("amount")), "total"]],
      raw: true,
    });
    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || 0);

    const currentMonth = formatMonth(new Date());
    const monthRevenueResult = await Payment.findAll({
      where: {
        payment_date: {
          [Op.gte]: getStartOfMonth(new Date()),
          [Op.lte]: getEndOfMonth(new Date()),
        },
      },
      attributes: [[require("sequelize").fn("SUM", require("sequelize").col("amount")), "total"]],
      raw: true,
    });
    const monthRevenue = parseFloat(monthRevenueResult[0]?.total || 0);

    const unpaidCount = await Invoice.count({ where: { status: "unpaid" } });
    const partialCount = await Invoice.count({ where: { status: "partial" } });

    return res.json({
      rooms: {
        total: totalRooms,
        available: availableRooms,
        rented: rentedRooms,
        maintenance: maintenanceRooms,
        occupancy_rate: totalRooms > 0 ? ((rentedRooms / totalRooms) * 100).toFixed(1) : 0,
      },
      tenants: { total: totalTenants },
      contracts: { active: activeContracts },
      revenue: {
        total: totalRevenue,
        month: monthRevenue,
        currency: "VND",
      },
      invoices: {
        unpaid: unpaidCount,
        partial: partialCount,
        unpaid_rate: (unpaidCount + partialCount) > 0 ? ((unpaidCount / (unpaidCount + partialCount)) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueStats = async (req, res, next) => {
  try {
    const { start_date, end_date, type = "monthly" } = req.query;

    const start = start_date ? new Date(start_date) : new Date(new Date().getFullYear(), 0, 1);
    const end = end_date ? new Date(end_date) : new Date();

    const payments = await Payment.findAll({
      where: {
        payment_date: { [Op.gte]: start, [Op.lte]: end },
      },
      include: [
        {
          model: Invoice,
          as: "invoice",
          attributes: ["billing_month"],
        },
      ],
      order: [["payment_date", "ASC"]],
    });

    const stats = {};
    for (const p of payments) {
      const month = p.payment_date
        ? new Date(p.payment_date).toISOString().substring(0, 7)
        : "unknown";
      if (!stats[month]) stats[month] = 0;
      stats[month] += parseFloat(p.amount);
    }

    const result = Object.entries(stats).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    return res.json({ stats: result, total: result.reduce((s, r) => s + r.total, 0) });
  } catch (error) {
    next(error);
  }
};

const getDebtStats = async (req, res, next) => {
  try {
    const unpaidInvoices = await Invoice.findAll({
      where: { status: { [Op.in]: ["unpaid", "partial"] } },
      include: [
        {
          model: Contract,
          as: "contract",
          include: [
            { model: Room, as: "room" },
            { model: Tenant, as: "tenant" },
          ],
        },
        { model: Payment, as: "payments", required: false },
      ],
      order: [["billing_month", "DESC"]],
    });

    const totalDebt = unpaidInvoices.reduce((sum, inv) => {
      const paidAmount = inv.payments
        ? inv.payments.reduce((s, p) => s + parseFloat(p.amount), 0)
        : 0;
      const remaining = parseFloat(inv.total_amount) - paidAmount;
      return sum + Math.max(0, remaining);
    }, 0);

    return res.json({
      total_debt: parseFloat(totalDebt.toFixed(2)),
      unpaid_invoices: unpaidInvoices,
      count: unpaidInvoices.length,
    });
  } catch (error) {
    next(error);
  }
};

const exportInvoicePDF = async (req, res, next) => {
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
        { model: Payment, as: "payments" },
        {
          model: require("../models").InvoiceDetail,
          as: "details",
          include: [{ model: Service, as: "service" }],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    const owner = await require("../models").OwnerConfig.findOne({ order: [["id", "ASC"]] });
    const { generateVietQR } = require("../services/vietqrService");

    let qrData = null;
    try {
      const monthLabel = invoice.billing_month.split("-").slice(1).join("/");
      qrData = await generateVietQR(
        invoice.total_amount,
        `${invoice.contract?.room?.room_number || "PHONG"} ${monthLabel}`
      );
    } catch (qrErr) {
      qrData = null;
    }

    const pdfBuffer = await generateInvoicePDF({
      invoice,
      contract: invoice.contract,
      tenant: invoice.contract?.tenant,
      room: invoice.contract?.room,
      details: invoice.details || [],
      owner,
      qrData,
      payments: invoice.payments || [],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="HoaDon-${invoice.id}-${invoice.billing_month}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const sendInvoiceEmailController = async (req, res, next) => {
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
        { model: InvoiceDetail, as: "details", include: [{ model: Service, as: "service" }] },
        { model: Payment, as: "payments" },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    const tenant = invoice.contract?.tenant;
    if (!tenant?.email) {
      return res.status(400).json({ message: "Nguoi thue chua co email." });
    }

    const owner = await require("../models").OwnerConfig.findOne({ order: [["id", "ASC"]] });
    const { generateVietQR } = require("../services/vietqrService");

    let qrData = null;
    try {
      const monthLabel = invoice.billing_month.split("-").reverse().join("/");
      qrData = await generateVietQR(
        invoice.total_amount,
        `${invoice.contract?.room?.room_number || "PHONG"} ${monthLabel}`
      );
    } catch (qrErr) {
      console.warn("QR generation failed:", qrErr.message);
      qrData = null;
    }

    const pdfBuffer = await generateInvoicePDF({
      invoice,
      contract: invoice.contract,
      tenant,
      room: invoice.contract?.room,
      details: invoice.details || [],
      owner,
      qrData,
      payments: invoice.payments || [],
    });

    const result = await sendInvoiceEmail({
      to: tenant.email,
      subject: `Hoa don thanh toan thang ${invoice.billing_month} - Phong ${invoice.contract?.room?.room_number}`,
      html: buildInvoiceEmailHtml({
        invoice,
        tenant,
        room: invoice.contract?.room,
        owner,
        totalAmount: invoice.total_amount,
        qrData,
        details: invoice.details || [],
      }),
      attachments: [
        {
          filename: `HoaDon-${invoice.id}-${invoice.billing_month}.pdf`,
          content: pdfBuffer,
        },
      ],
      qrImageBase64: qrData?.qrImageBase64 || null,
      qrImageBuffer: qrData?.qrImageBuffer || null,
    });

    return res.json({ message: "Gui email thanh cong.", result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getRevenueStats,
  getDebtStats,
  exportInvoicePDF,
  sendInvoiceEmailController,
};
