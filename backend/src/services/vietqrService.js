const { OwnerConfig } = require("../models");

const getBankCode = (bankName) => {
  const name = (bankName || "").toLowerCase();
  const map = {
    vietcombank: "970436",
    vietinbank: "970415",
    bidv: "970418",
    agribank: "970405",
    tcb: "970407",
    mb: "970422",
    acb: "970416",
    techcombank: "970407",
    vietcapitalbank: "970433",
    shinhanbank: "970421",
    vpbank: "970432",
    tpbank: "970423",
    sacombank: "970403",
    eximbank: "970431",
  };
  return map[name] || "970436";
};

const generateVietQR = async (amount, description) => {
  const config = await OwnerConfig.findOne({ order: [["id", "ASC"]] });

  if (!config) {
    throw { status: 400, message: "Chua cau hinh thong tin chu tro. Vui long cau hinh VietQR." };
  }

  const bankCode = getBankCode(config.bank_name);
  const accountNo = config.bank_account.replace(/\s/g, "");
  const accountName = (config.owner_name || "").trim();
  const addInfo = (description || "Thanh toan tien phong tro").trim();

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png?amount=${encodeURIComponent(String(Math.round(amount || 0)))}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;

  const qrRes = await fetch(qrUrl);
  if (!qrRes.ok) {
    throw { status: 400, message: "Khong tao duoc ma QR VietQR." };
  }

  const arrayBuffer = await qrRes.arrayBuffer();
  const qrImageBuffer = Buffer.from(arrayBuffer);
  const qrImageBase64 = `data:image/png;base64,${qrImageBuffer.toString("base64")}`;

  return {
    bank_code: bankCode,
    account_no: accountNo,
    account_name: accountName,
    bank_name: config.bank_name,
    bank_branch: config.bank_branch || "",
    amount,
    description: addInfo,
    qr_content: qrUrl,
    qrImageBase64,
    qrImageBuffer,
  };
};

module.exports = { generateVietQR, getBankCode };
