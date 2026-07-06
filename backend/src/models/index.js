const sequelize = require("../config/database");
const Account = require("./Account");
const OwnerConfig = require("./OwnerConfig");
const Room = require("./Room");
const Tenant = require("./Tenant");
const Service = require("./Service");
const Contract = require("./Contract");
const MeterReading = require("./MeterReading");
const Invoice = require("./Invoice");
const InvoiceDetail = require("./InvoiceDetail");
const Payment = require("./Payment");
const Adjustment = require("./Adjustment");

Account.hasMany(Contract, { foreignKey: "account_id", as: "contracts" });
Contract.belongsTo(Account, { foreignKey: "account_id", as: "account" });

Room.hasMany(Contract, { foreignKey: "room_id", as: "contracts" });
Contract.belongsTo(Room, { foreignKey: "room_id", as: "room" });

Tenant.hasMany(Contract, { foreignKey: "tenant_id", as: "contracts" });
Contract.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Room.hasMany(MeterReading, { foreignKey: "room_id", as: "meterReadings" });
MeterReading.belongsTo(Room, { foreignKey: "room_id", as: "room" });

Contract.hasMany(Invoice, { foreignKey: "contract_id", as: "invoices" });
Invoice.belongsTo(Contract, { foreignKey: "contract_id", as: "contract" });

Invoice.hasMany(InvoiceDetail, { foreignKey: "invoice_id", as: "details" });
InvoiceDetail.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });

Service.hasMany(InvoiceDetail, { foreignKey: "service_id", as: "invoiceDetails" });
InvoiceDetail.belongsTo(Service, { foreignKey: "service_id", as: "service" });

Invoice.hasMany(Payment, { foreignKey: "invoice_id", as: "payments" });
Payment.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });

Contract.hasMany(Adjustment, { foreignKey: "contract_id", as: "adjustments" });
Adjustment.belongsTo(Contract, { foreignKey: "contract_id", as: "contract" });

module.exports = {
  sequelize,
  Account,
  OwnerConfig,
  Room,
  Tenant,
  Service,
  Contract,
  MeterReading,
  Invoice,
  InvoiceDetail,
  Payment,
  Adjustment,
};
