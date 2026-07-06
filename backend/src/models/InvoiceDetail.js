const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InvoiceDetail = sequelize.define(
  "InvoiceDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoice_id: {
      type: DataTypes.INTEGER,
    },
    service_id: {
      type: DataTypes.INTEGER,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_details",
    timestamps: false,
  }
);

module.exports = InvoiceDetail;
