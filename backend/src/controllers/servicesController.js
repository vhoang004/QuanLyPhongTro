const { Service } = require("../models");
const { Op } = require("sequelize");

const getAllServices = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { service_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const services = await Service.findAll({
      where,
      order: [["id", "ASC"]],
    });

    return res.json({ data: services, count: services.length });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const { service_name, unit_price, unit } = req.body;

    if (!service_name || unit_price === undefined || !unit) {
      return res.status(400).json({ message: "Cac truong bat buoc: service_name, unit_price, unit." });
    }

    if (parseFloat(unit_price) < 0) {
      return res.status(400).json({ message: "Don gia khong duoc am." });
    }

    const existing = await Service.findOne({
      where: { service_name: service_name.trim() },
    });
    if (existing) {
      return res.status(400).json({ message: "Dich vu nay da ton tai." });
    }

    const service = await Service.create({
      service_name: service_name.trim(),
      unit_price: parseFloat(unit_price),
      unit: unit.trim(),
    });

    return res.status(201).json({ message: "Tao dich vu thanh cong.", service });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { service_name, unit_price, unit } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Dich vu khong ton tai." });
    }

    if (service_name !== undefined && !service_name.trim()) {
      return res.status(400).json({ message: "Ten dich vu khong duoc rong." });
    }
    if (unit_price !== undefined && parseFloat(unit_price) < 0) {
      return res.status(400).json({ message: "Don gia khong duoc am." });
    }
    if (unit !== undefined && !unit.trim()) {
      return res.status(400).json({ message: "Don vi khong duoc rong." });
    }

    if (service_name) {
      const duplicate = await Service.findOne({
        where: { service_name: service_name.trim(), id: { [Op.ne]: id } },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Ten dich vu da ton tai." });
      }
      service.service_name = service_name.trim();
    }
    if (unit_price !== undefined) service.unit_price = parseFloat(unit_price);
    if (unit) service.unit = unit.trim();

    await service.save();

    return res.json({ message: "Cap nhat dich vu thanh cong.", service });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Dich vu khong ton tai." });
    }

    await service.destroy();

    return res.json({ message: "Xoa dich vu thanh cong." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
