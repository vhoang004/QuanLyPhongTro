const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tenant = sequelize.define(
  "Tenant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    citizen_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
    },
    address: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "tenants",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Tenant;
