const { Tenant, Contract, sequelize } = require("../models");
const { Op, fn, col } = require("sequelize");

/**
 * Get all tenants filtered by account_id.
 * Uses JSON_TABLE on MySQL 8+ to expand tenant_ids JSON array.
 */
const getAllTenants = async ({ page = 1, limit = 10, search = "" }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { citizen_id: { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Tenant.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [["created_at", "ASC"]],
  });

  return { rows, count };
};

module.exports = { getAllTenants };
