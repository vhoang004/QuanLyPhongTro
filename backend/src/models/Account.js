const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const Account = sequelize.define(
  "Account",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM("admin", "manager"),
      defaultValue: "manager",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    reset_otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    reset_otp_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "accounts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (account) => {
        if (account.password) {
          account.password = await bcrypt.hash(account.password, 10);
        }
      },
      beforeUpdate: async (account) => {
        if (account.changed("password")) {
          account.password = await bcrypt.hash(account.password, 10);
        }
      },
    },
  }
);

Account.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

Account.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = Account;
