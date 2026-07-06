/**
 * Migration: Assign account_id to existing contracts without one
 * Run: node src/migrations/migrateAccountId.js
 */
const { sequelize, Contract, Account } = require("../models");

async function migrate() {
  console.log("Starting migration...");

  try {
    // Find contracts without account_id
    const orphanedContracts = await Contract.findAll({
      where: { account_id: null },
    });
    console.log(`Found ${orphanedContracts.length} contracts without account_id`);

    if (orphanedContracts.length === 0) {
      console.log("No contracts need migration. Done.");
      process.exit(0);
    }

    // Get first admin or first manager as default owner
    const defaultAccount = await Account.findOne({
      where: { role: "admin" },
      order: [["id", "ASC"]],
    }) || await Account.findOne({
      where: { role: "manager" },
      order: [["id", "ASC"]],
    });

    if (!defaultAccount) {
      console.error("No account found in database. Please create an admin account first.");
      process.exit(1);
    }

    console.log(`Assigning orphaned contracts to account: ${defaultAccount.username} (id=${defaultAccount.id})`);

    const [affectedRows] = await Contract.update(
      { account_id: defaultAccount.id },
      { where: { account_id: null } }
    );

    console.log(`Migration complete: ${affectedRows} contracts updated`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
