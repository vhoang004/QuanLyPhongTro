const { Tenant, Contract, sequelize } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse } = require("../services/helpers");
const { getAllTenants } = require("../services/tenantService");

// Helper: check if tenant belongs to any contract under this account
async function tenantBelongsToAccount(tenantId, accountId, isAdmin) {
  if (isAdmin) return true;
  const found = await Contract.findOne({
    where: {
      [Op.or]: [
        { tenant_id: tenantId },
        { tenant_ids: { [Op.contains]: [tenantId] } },
      ],
      account_id: accountId,
    },
    attributes: ["id"],
  });
  return !!found;
}

const getTenantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: "Nguoi thue khong ton tai." });
    }

    const isAdmin = req.user.role === 'admin';
    const hasAccess = await tenantBelongsToAccount(id, req.user.id, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({ message: "Ban khong co quyen xem nguoi thue nay." });
    }

    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [
          { tenant_id: id },
          { tenant_ids: { [Op.contains]: [id] } },
        ],
        ...(isAdmin ? {} : { account_id: req.user.id }),
      },
      include: ["room"],
      order: [["created_at", "DESC"]],
    });

    return res.json({ tenant, contracts });
  } catch (error) {
    next(error);
  }
};

const getAllTenantsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const { rows, count } = await getAllTenants({
      page,
      limit,
      search,
      accountId: req.user.id,
      isAdmin: req.user.role === 'admin',
    });

    return res.json(buildPaginationResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const createTenant = async (req, res, next) => {
  try {
    const { full_name, citizen_id, phone_number, email, address } = req.body;

    if (!full_name || !citizen_id || !phone_number) {
      return res.status(400).json({ message: "Ho ten, CCCD va so dien thoai la bat buoc." });
    }

    const existing = await Tenant.findOne({ where: { citizen_id } });
    if (existing) {
      return res.status(409).json({ message: "So CCCD da ton tai trong he thong." });
    }

    const tenant = await Tenant.create({ full_name, citizen_id, phone_number, email, address });
    return res.status(201).json({ message: "Tao nguoi thue thanh cong.", tenant });
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: "Nguoi thue khong ton tai." });
    }

    const isAdmin = req.user.role === 'admin';
    const hasAccess = await tenantBelongsToAccount(id, req.user.id, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({ message: "Ban khong co quyen sua nguoi thue nay." });
    }

    const fields = { full_name, phone_number, email, address };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) tenant[key] = value;
    }

    await tenant.save();
    return res.json({ message: "Cap nhat nguoi thue thanh cong.", tenant });
  } catch (error) {
    next(error);
  }
};

const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: "Nguoi thue khong ton tai." });
    }

    const isAdmin = req.user.role === 'admin';
    const hasAccess = await tenantBelongsToAccount(id, req.user.id, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({ message: "Ban khong co quyen xoa nguoi thue nay." });
    }

    const activeContract = await Contract.findOne({
      where: {
        [Op.or]: [
          { tenant_id: id, status: "active" },
          { tenant_ids: { [Op.contains]: [id] }, status: "active" },
        ],
        ...(isAdmin ? {} : { account_id: req.user.id }),
      },
    });

    if (activeContract) {
      return res.status(400).json({
        message: "Nguoi thue dang co hop dong active. Vui long thanh ly truoc.",
      });
    }

    await tenant.destroy();
    return res.json({ message: "Xoa nguoi thue thanh cong." });
  } catch (error) {
    next(error);
  }
};

const getTenantHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: "Nguoi thue khong ton tai." });
    }

    const isAdmin = req.user.role === 'admin';
    const hasAccess = await tenantBelongsToAccount(id, req.user.id, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({ message: "Ban khong co quyen xem lich su nguoi thue nay." });
    }

    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [
          { tenant_id: id },
          { tenant_ids: { [Op.contains]: [id] } },
        ],
        ...(isAdmin ? {} : { account_id: req.user.id }),
      },
      include: ["room"],
      order: [["start_date", "DESC"]],
    });

    return res.json({ tenant, history: contracts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTenants: getAllTenantsHandler,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantHistory,
};
