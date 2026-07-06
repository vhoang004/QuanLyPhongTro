const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contract = sequelize.define(
  "Contract",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
    },
    tenant_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    account_id: {
      type: DataTypes.INTEGER,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    price_per_month: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    terms: {
      type: DataTypes.TEXT,
    },
    handover_status: {
      type: DataTypes.ENUM("good", "damaged", "none"),
      defaultValue: "none",
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "terminated"),
      defaultValue: "active",
    },
  },
  {
    tableName: "contracts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Contract;
