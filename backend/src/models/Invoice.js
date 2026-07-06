const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contract_id: {
      type: DataTypes.INTEGER,
    },
    billing_month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    room_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    electricity_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    water_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_service_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    adjustment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("unpaid", "partial", "paid"),
      defaultValue: "unpaid",
    },
    payment_date: {
      type: DataTypes.DATEONLY,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "bank_transfer", "qr"),
      defaultValue: "cash",
    },
    qr_content: {
      type: DataTypes.STRING(500),
    },
  },
  {
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["contract_id", "billing_month"],
      },
    ],
  }
);

module.exports = Invoice;
