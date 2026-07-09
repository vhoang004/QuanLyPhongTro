const { Tenant, Contract, sequelize } = require("../models");
const { Op } = require("sequelize");
const { paginateQuery, buildPaginationResponse, jsonContains } = require("../services/helpers");
const { getAllTenants } = require("../services/tenantService");

// Trim a string and clamp to max length. Matches VARCHAR(N) limits in Tenant model
// so callers sending form data with stray whitespace or > N chars don't hit a 500.
const clampString = (value, max) => {
  if (value === undefined || value === null) return value;
  const trimmed = String(value).trim();
  return trimmed.slice(0, max);
};

// Helper: check if tenant belongs to any contract under this account
async function tenantBelongsToAccount(tenantId, accountId, isAdmin) {
  if (isAdmin) return true;
  const found = await Contract.findOne({
    where: {
      [Op.or]: [
        { tenant_id: tenantId },
        jsonContains("tenant_ids", tenantId),
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
          jsonContains("tenant_ids", id),
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
    const { full_name, citizen_id, phone_number, email, address } = req.body;
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: "Nguoi thue khong ton tai." });
    }

    const isAdmin = req.user.role === 'admin';
    const accountActive = req.user.status === 'active';
    if (!isAdmin && !accountActive) {
      return res.status(403).json({ message: "Tai khoan khong active, khong the sua nguoi thue." });
    }

    const fields = {
      full_name: clampString(full_name, 100),
      citizen_id: clampString(citizen_id, 20),
      phone_number: clampString(phone_number, 15),
      email: clampString(email, 100),
      address: clampString(address, 255),
    };
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
    const accountActive = req.user.status === 'active';
    if (!isAdmin && !accountActive) {
      return res.status(403).json({ message: "Tai khoan khong active, khong the xoa nguoi thue." });
    }

    // Block delete if ANY active contract (across all accounts) still references this tenant.
    // The contract itself is scoped to an account, but a tenant is shared data — refusing
    // to delete a tenant still bound to an active contract anywhere prevents data loss.
    const activeContract = await Contract.findOne({
      where: {
        [Op.and]: [
          { status: "active" },
          {
            [Op.or]: [
              { tenant_id: id },
              jsonContains("tenant_ids", id),
            ],
          },
        ],
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
          jsonContains("tenant_ids", id),
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
