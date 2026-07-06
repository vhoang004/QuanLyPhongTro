const {
  Contract, Room, Tenant, Service, MeterReading,
  Adjustment, Invoice, InvoiceDetail, Payment, OwnerConfig
} = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse, formatMonth, paginate } = require("../services/helpers");
const { generateVietQR } = require("../services/vietqrService");

const getAllInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, billing_month, room_id, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (billing_month) where.billing_month = billing_month;
    if (room_id) where["$contract.room_id$"] = room_id;

    let contractWhere = {};
    if (search) {
      const rooms = await Room.findAll({
        where: { [Op.or]: [{ room_number: { [Op.like]: `%${search}%` } }] },
        attributes: ["id"],
      });
      const roomIds = rooms.map((r) => r.id);
      if (roomIds.length > 0) {
        contractWhere = { room_id: { [Op.in]: roomIds } };
      }
    }

    const { rows, count } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Contract,
          as: "contract",
          where: {
            ...(Object.keys(contractWhere).length ? contractWhere : {}),
            ...(req.user.role !== 'admin' ? { account_id: req.user.id } : {}),
          },
          include: [
            { model: Room, as: "room" },
            { model: Tenant, as: "tenant" },
          ],
        },
        { model: Payment, as: "payments" },
      ],
      order: [["billing_month", "DESC"], ["created_at", "DESC"]],
      ...paginateQuery({ page, limit }),
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
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
        { model: Payment, as: "payments" },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    return res.json({ invoice });
  } catch (error) {
    next(error);
  }
};

const generateInvoice = async (req, res, next) => {
  try {
    const { contract_id, billing_month } = req.body;

    if (!contract_id || !billing_month) {
      return res.status(400).json({ message: "Contract ID va billing_month la bat buoc." });
    }

    const contract = await Contract.findByPk(contract_id, {
      include: [{ model: Room, as: "room" }],
    });

    if (!contract) {
      return res.status(404).json({ message: "Hop dong khong ton tai." });
    }

    if (contract.status !== "active") {
      return res.status(400).json({ message: "Chi tao hoa don cho hop dong dang active." });
    }

    const existing = await Invoice.findOne({
      where: { contract_id, billing_month },
    });
    if (existing) {
      return res.status(409).json({
        message: "Hoa don da ton tai cho ky nay.",
        invoice: existing,
      });
    }

    const electricityService = await Service.findOne({
      where: { service_name: { [Op.like]: "%dien%" } },
    });
    const waterService = await Service.findOne({
      where: { service_name: { [Op.like]: "%nuoc%" } },
    });

    let electricityAmount = 0;
    let waterAmount = 0;
    let totalServicePrice = 0;
    let serviceDetails = [];

    const meterReading = await MeterReading.findOne({
      where: { room_id: contract.room_id, billing_month },
    });

    if (meterReading) {
      const elecUsed = meterReading.current_electricity - meterReading.prev_electricity;
      const waterUsed = meterReading.current_water - meterReading.prev_water;

      if (electricityService) {
        electricityAmount = parseFloat((elecUsed * parseFloat(electricityService.unit_price)).toFixed(2));
      }
      if (waterService) {
        waterAmount = parseFloat((waterUsed * parseFloat(waterService.unit_price)).toFixed(2));
      }
    }

    const adjustments = await Adjustment.findAll({
      where: { contract_id, billing_month },
    });

    const otherServices = await Service.findAll({
      where: {
        [Op.and]: [
          { service_name: { [Op.notLike]: "%dien%" } },
          { service_name: { [Op.notLike]: "%nuoc%" } },
        ],
      },
    });

    for (const svc of otherServices) {
      const subtotal = parseFloat(svc.unit_price);
      totalServicePrice += subtotal;
      serviceDetails.push({
        service_id: svc.id,
        quantity: 1,
        unit_price: svc.unit_price,
        subtotal: subtotal,
      });
    }

    let adjustmentAmount = 0;
    for (const adj of adjustments) {
      if (adj.type === "surcharge") {
        adjustmentAmount += parseFloat(adj.amount);
      } else {
        adjustmentAmount -= parseFloat(adj.amount);
      }
    }
    adjustmentAmount = parseFloat(adjustmentAmount.toFixed(2));

    const totalAmount = parseFloat(
      (
        parseFloat(contract.price_per_month) +
        electricityAmount +
        waterAmount +
        totalServicePrice +
        adjustmentAmount
      ).toFixed(2)
    );

    const invoice = await Invoice.create({
      contract_id,
      billing_month,
      room_price: contract.price_per_month,
      electricity_amount: electricityAmount,
      water_amount: waterAmount,
      total_service_price: totalServicePrice,
      adjustment_amount: adjustmentAmount,
      total_amount: totalAmount,
      status: "unpaid",
    });

    for (const detail of serviceDetails) {
      await InvoiceDetail.create({
        invoice_id: invoice.id,
        service_id: detail.service_id,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        subtotal: detail.subtotal,
      });
    }

    return res.status(201).json({ message: "Tao hoa don thanh cong.", invoice });
  } catch (error) {
    next(error);
  }
};

const generateBatchInvoices = async (req, res, next) => {
  try {
    const { billing_month } = req.body;

    if (!billing_month) {
      return res.status(400).json({ message: "billing_month la bat buoc." });
    }

    const activeContracts = await Contract.findAll({
      where: { status: "active" },
      include: [{ model: Room, as: "room" }],
    });

    // Lay cac dich vu khac (khong tinh dien, nuoc)
    const otherServices = await Service.findAll({
      where: {
        [Op.and]: [
          { service_name: { [Op.notLike]: "%dien%" } },
          { service_name: { [Op.notLike]: "%nuoc%" } },
        ],
      },
    });

    const results = { created: [], skipped: [], errors: [] };

    for (const contract of activeContracts) {
      try {
        const existing = await Invoice.findOne({
          where: { contract_id: contract.id, billing_month },
        });
        if (existing) {
          results.skipped.push({ contract_id: contract.id, room: contract.room?.room_number });
          continue;
        }

        const meterReading = await MeterReading.findOne({
          where: { room_id: contract.room_id, billing_month },
        });

        let elecAmt = 0;
        let wtrAmt = 0;

        if (meterReading) {
          const electricityService = await Service.findOne({
            where: { service_name: { [Op.like]: "%dien%" } },
          });
          const waterService = await Service.findOne({
            where: { service_name: { [Op.like]: "%nuoc%" } },
          });

          if (electricityService) {
            const used = meterReading.current_electricity - meterReading.prev_electricity;
            elecAmt = parseFloat((used * parseFloat(electricityService.unit_price)).toFixed(2));
          }
          if (waterService) {
            const used = meterReading.current_water - meterReading.prev_water;
            wtrAmt = parseFloat((used * parseFloat(waterService.unit_price)).toFixed(2));
          }
        }

        // Tinh tien dich vu khac
        let totalServicePrice = 0;
    let serviceDetails = [];
        for (const svc of otherServices) {
          totalServicePrice += parseFloat(svc.unit_price);
        }

        const adjustments = await Adjustment.findAll({
          where: { contract_id: contract.id, billing_month },
        });

        let adjAmt = 0;
        for (const adj of adjustments) {
          adjAmt += adj.type === "surcharge" ? parseFloat(adj.amount) : -parseFloat(adj.amount);
        }

        const total = parseFloat(
          (parseFloat(contract.price_per_month) + elecAmt + wtrAmt + totalServicePrice + adjAmt).toFixed(2)
        );

        const invoice = await Invoice.create({
          contract_id: contract.id,
          billing_month,
          room_price: contract.price_per_month,
          electricity_amount: elecAmt,
          water_amount: wtrAmt,
          total_service_price: totalServicePrice,
          adjustment_amount: adjAmt,
          total_amount: total,
          status: "unpaid",
        });

        // Tao chi tiet hoa don
        for (const svc of otherServices) {
          await InvoiceDetail.create({
            invoice_id: invoice.id,
            service_id: svc.id,
            quantity: 1,
            unit_price: svc.unit_price,
            subtotal: parseFloat(svc.unit_price),
          });
        }

        results.created.push({ contract_id: contract.id, room: contract.room?.room_number });
      } catch (err) {
        results.errors.push({ contract_id: contract.id, error: err.message });
      }
    }

    return res.json({
      message: `Tao hoa don hoan tat. Tao: ${results.created.length}, Bo qua: ${results.skipped.length}, Loi: ${results.errors.length}.`,
      results,
    });
  } catch (error) {
    next(error);
  }
};

const generateQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Contract,
          as: "contract",
          include: [{ model: Room, as: "room" }],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Hoa don khong ton tai." });
    }

    const monthLabel = invoice.billing_month.split("-").slice(1).join("/");
    const description = `${invoice.contract?.room?.room_number || "PHONG"} ${monthLabel}`;

    const qrData = await generateVietQR(invoice.total_amount, description);

    invoice.qr_content = qrData.qr_content;
    await invoice.save();

    return res.json({ qr_data: qrData, invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  generateInvoice,
  generateBatchInvoices,
  generateQRCode,
};
