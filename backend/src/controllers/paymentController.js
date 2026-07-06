const { Payment, Invoice, Contract, Room, Tenant } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse } = require("../services/helpers");

const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, invoice_id, payment_method, start_date, end_date } = req.query;

    const where = {};
    if (invoice_id) where.invoice_id = invoice_id;
    if (payment_method) where.payment_method = payment_method;
    if (start_date || end_date) {
      where.payment_date = {};
      if (start_date) where.payment_date[Op.gte] = start_date;
      if (end_date) where.payment_date[Op.lte] = end_date;
    }

    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Invoice,
          as: "invoice",
          include: [
            {
              model: Contract,
              as: "contract",
              where: req.user.role !== 'admin' ? { account_id: req.user.id } : {},
              include: [
                { model: Room, as: "room" },
                { model: Tenant, as: "tenant" },
              ],
            },
          ],
        },
      ],
      order: [["payment_date", "DESC"]],
      ...paginateQuery({ page, limit }),
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { invoice_id, amount, payment_method, note } = req.body;

    if (!invoice_id || !amount || !payment_method) {
      return res.status(400).json({ message: "Invoice ID, so tien va phuong thuc thanh toan la bat buoc." });
    }

    const invoice = await Invoice.findByPk(invoice_id, {
      include: [{ model: Contract, as: "contract" }],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Hoa don da duoc thanh toan." });
    }

    const amountNum = parseFloat(amount);
    const totalAmount = parseFloat(invoice.total_amount);

    const existingPayments = await Payment.findAll({
      where: { invoice_id },
    });

    let totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    totalPaid = parseFloat(totalPaid) + amountNum;

    const payment = await Payment.create({
      invoice_id,
      amount: amountNum,
      payment_date: new Date(),
      payment_method,
      note,
    });

    if (totalPaid >= totalAmount) {
      invoice.status = "paid";
      invoice.payment_date = invoice.payment_date || new Date().toISOString().split("T")[0];
      invoice.payment_method = invoice.payment_method || payment_method;
    } else if (totalPaid > 0) {
      invoice.status = "partial";
    }

    await invoice.save();

    return res.status(201).json({
      message: invoice.status === "paid" ? "Thanh toan hoan tat." : "Ghi nhan thanh toan thanh cong.",
      payment,
      invoice_status: invoice.status,
      total_paid: totalPaid,
      remaining: parseFloat((totalAmount - totalPaid).toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByInvoice = async (req, res, next) => {
  try {
    const { invoice_id } = req.params;

    const invoice = await Invoice.findByPk(invoice_id);
    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    const payments = await Payment.findAll({
      where: { invoice_id },
      order: [["payment_date", "ASC"]],
    });

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const remaining = parseFloat((parseFloat(invoice.total_amount) - totalPaid).toFixed(2));

    return res.json({ payments, total_paid: totalPaid, remaining, invoice_status: invoice.status });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method = "cash", note, amount } = req.body;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Invoice,
          as: "invoice",
          include: [{ model: Contract, as: "contract" }],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Kenh thanh toan khong ton tai." });
    }

    const invoice = payment.invoice;

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Hoa don da duoc thanh toan." });
    }

    const existingPayments = await Payment.findAll({
      where: { invoice_id: invoice.id },
    });

    const amountNum =
      amount !== undefined && amount !== null && amount !== ""
        ? parseFloat(amount)
        : parseFloat(invoice.total_amount);

    let totalPaid = existingPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    totalPaid = parseFloat(totalPaid) + amountNum;

    const newPayment = await Payment.create({
      invoice_id: invoice.id,
      amount: amountNum,
      payment_date: new Date(),
      payment_method,
      note: note || "Xac nhan thanh toan truc tiep",
    });

    if (totalPaid >= parseFloat(invoice.total_amount)) {
      invoice.status = "paid";
      invoice.payment_date = invoice.payment_date || new Date().toISOString().split("T")[0];
      invoice.payment_method = invoice.payment_method || payment_method;
    } else if (totalPaid > 0) {
      invoice.status = "partial";
    }

    await invoice.save();

    return res.json({
      message: "Xac nhan thanh toan thanh cong.",
      payment: newPayment,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  recordPayment,
  getPaymentsByInvoice,
  confirmPayment,
};
