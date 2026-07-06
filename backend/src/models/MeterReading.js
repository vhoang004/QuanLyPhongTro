const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MeterReading = sequelize.define(
  "MeterReading",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
    },
    billing_month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_electricity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    current_electricity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prev_water: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    current_water: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "meter_readings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["room_id", "billing_month"],
      },
    ],
  }
);

module.exports = MeterReading;
