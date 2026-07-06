const { Tenant, Contract, sequelize } = require("../models");
const { Op, fn, col } = require("sequelize");

/**
 * Get all tenants filtered by account_id.
 * Uses JSON_TABLE on MySQL 8+ to expand tenant_ids JSON array.
 */
const getAllTenants = async ({ page = 1, limit = 10, search = "", accountId, isAdmin = false }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Base where for search
  const baseWhere = {};
  if (search) {
    baseWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { citizen_id: { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
    ];
  }

  // Multi-tenant: build subquery to find all tenant_ids belonging to account
  // Includes both tenant_id (single) and tenant_ids (JSON array via JSON_TABLE)
  const rawTenantIds = isAdmin
    ? `SELECT tenant_id FROM contracts WHERE tenant_id IS NOT NULL
       UNION
       SELECT jt.tenant_id FROM contracts, JSON_TABLE(contracts.tenant_ids, '$[*]' COLUMNS (tenant_id INT PATH '$')) AS jt`
    : `SELECT tenant_id FROM contracts WHERE tenant_id IS NOT NULL AND contracts.account_id = ${parseInt(accountId)}
       UNION
       SELECT jt.tenant_id FROM contracts, JSON_TABLE(contracts.tenant_ids, '$[*]' COLUMNS (tenant_id INT PATH '$')) AS jt WHERE contracts.account_id = ${parseInt(accountId)}`;

  // Count query
  const countSql = `
    SELECT COUNT(*) as total FROM tenants t
    WHERE t.id IN (${rawTenantIds})
    ${search ? `AND (t.full_name LIKE :search OR t.citizen_id LIKE :search OR t.phone_number LIKE :search)` : ""}
  `;

  const countResult = await sequelize.query(countSql, {
    replacements: { search: `%${search}%` },
    type: sequelize.QueryTypes.SELECT,
    raw: true,
  });
  const total = countResult[0]?.total || 0;

  // Data query
  const dataSql = `
    SELECT t.* FROM tenants t
    WHERE t.id IN (${rawTenantIds})
    ${search ? `AND (t.full_name LIKE :search OR t.citizen_id LIKE :search OR t.phone_number LIKE :search)` : ""}
    ORDER BY t.created_at ASC
    LIMIT :limit OFFSET :offset
  `;

  const rows = await sequelize.query(dataSql, {
    replacements: { search: `%${search}%`, limit: parseInt(limit), offset },
    type: sequelize.QueryTypes.SELECT,
    model: Tenant,
    mapToModel: true,
  });

  return { rows, count: total };
};

module.exports = { getAllTenants };
