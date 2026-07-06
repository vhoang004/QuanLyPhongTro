const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoice_id: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "bank_transfer", "qr"),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Payment;
