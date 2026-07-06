const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Adjustment = sequelize.define(
  "Adjustment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contract_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    billing_month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("surcharge", "discount"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      field: "reason",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "adjustments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Adjustment;
