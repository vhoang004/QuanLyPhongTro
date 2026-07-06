const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    room_name: {
      type: DataTypes.STRING(100),
    },
    room_type: {
      type: DataTypes.ENUM("standard", "deluxe"),
      defaultValue: "standard",
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    area: {
      type: DataTypes.DECIMAL(6, 2),
    },
    floor: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    address: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    amenities: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("available", "rented", "maintenance", "inactive"),
      defaultValue: "available",
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    electricity_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 3500,
    },
    water_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 15000,
    },
    internet_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    parking_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    other_services_price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Room;
