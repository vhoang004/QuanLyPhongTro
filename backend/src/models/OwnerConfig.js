const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OwnerConfig = sequelize.define(
  "OwnerConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    owner_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bank_account: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bank_branch: {
      type: DataTypes.STRING(100),
    },
    qr_template: {
      type: DataTypes.STRING(50),
      defaultValue: "vietqr",
    },
  },
  {
    tableName: "owner_config",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = OwnerConfig;
