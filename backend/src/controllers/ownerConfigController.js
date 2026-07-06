const { OwnerConfig } = require("../models");

const getConfig = async (req, res, next) => {
  try {
    let config = await OwnerConfig.findOne({ order: [["id", "ASC"]] });
    if (!config) {
      config = await OwnerConfig.create({
        owner_name: "Chua cau hinh",
        bank_account: "",
        bank_name: "",
        bank_branch: "",
        qr_template: "vietqr",
      });
    }
    return res.json({ config });
  } catch (error) {
    next(error);
  }
};

const updateConfig = async (req, res, next) => {
  try {
    const { owner_name, bank_account, bank_name, bank_branch, qr_template } = req.body;

    let config = await OwnerConfig.findOne({ order: [["id", "ASC"]] });

    if (!config) {
      config = await OwnerConfig.create({
        owner_name: owner_name || "",
        bank_account: bank_account || "",
        bank_name: bank_name || "",
        bank_branch: bank_branch || "",
        qr_template: qr_template || "vietqr",
      });
      return res.status(201).json({ message: "Tao cau hinh thanh cong.", config });
    }

    if (owner_name !== undefined) config.owner_name = owner_name;
    if (bank_account !== undefined) config.bank_account = bank_account;
    if (bank_name !== undefined) config.bank_name = bank_name;
    if (bank_branch !== undefined) config.bank_branch = bank_branch;
    if (qr_template !== undefined) config.qr_template = qr_template;

    await config.save();
    return res.json({ message: "Cap nhat cau hinh thanh cong.", config });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConfig, updateConfig };
