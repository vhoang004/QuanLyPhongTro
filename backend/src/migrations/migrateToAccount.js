/**
 * Assign all contracts to a specific account_id
 * Usage: node migrateToAccount.js <target_account_id>
 */
const { sequelize, Contract } = require("../models");
const { Op } = require("sequelize");

async function migrate() {
  const targetId = parseInt(process.argv[2]);
  if (!targetId) {
    console.error("Usage: node migrateToAccount.js <account_id>");
    process.exit(1);
  }

  await sequelize.authenticate();
  const [n] = await Contract.update(
    { account_id: targetId },
    { where: { account_id: { [Op.ne]: targetId } } }
  );
  console.log(`Updated ${n} contracts to account_id=${targetId}`);
  await sequelize.close();
}

migrate();
