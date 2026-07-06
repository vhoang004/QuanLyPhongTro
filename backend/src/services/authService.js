const jwt = require("jsonwebtoken");
const { Account } = require("../models");
const { sendInvoiceEmail } = require("./emailService");

const generateToken = (account) => {
  return jwt.sign(
    { id: account.id, username: account.username, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const login = async (username, password, res) => {
  const account = await Account.findOne({ where: { username } });

  if (!account) {
    throw { status: 401, message: "Tai khoan hoac mat khau khong dung." };
  }

  if (account.status !== "active") {
    throw { status: 403, message: "Tai khoan da bi khoa." };
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    throw { status: 401, message: "Tai khoan hoac mat khau khong dung." };
  }

  const token = generateToken(account);

  if (res) {
    setTokenCookie(res, token);
    const { password: _, ...userData } = account.toJSON();
    return { token, user: userData };
  }

  const { password: _, ...userData } = account.toJSON();
  return { token, user: userData };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const account = await Account.findByPk(userId);

  if (!account) {
    throw { status: 404, message: "Tai khoan khong ton tai." };
  }

  const isMatch = await account.comparePassword(currentPassword);
  if (!isMatch) {
    throw { status: 400, message: "Mat khau hien tai khong dung." };
  }

  account.password = newPassword;
  await account.save();

  return { message: "Doi mat khau thanh cong." };
};

const resetPassword = async (email) => {
  const account = await Account.findOne({ where: { email } });

  if (!account) {
    throw { status: 404, message: "Email khong ton tai trong he thong." };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  account.reset_otp = otp;
  account.reset_otp_expires = expires;
  await account.save();

  await sendInvoiceEmail({
    to: email,
    subject: "[QLPT] Ma xac minh dat lai mat khau",
    html: buildResetPasswordEmailHtml({ otp, expires: "10 phut" }),
  });

  return { message: "Ma xac minh da duoc gui toi email.", email };
};

const verifyOtpAndReset = async (email, otp, newPassword) => {
  const account = await Account.findOne({ where: { email } });

  if (!account) {
    throw { status: 404, message: "Email khong ton tai trong he thong." };
  }

  if (!account.reset_otp || account.reset_otp !== otp) {
    throw { status: 400, message: "Ma xac minh khong dung." };
  }

  if (!account.reset_otp_expires || new Date() > new Date(account.reset_otp_expires)) {
    throw { status: 400, message: "Ma xac minh da het han. Vui long gui lai yeu cau." };
  }

  if (newPassword.length < 6) {
    throw { status: 400, message: "Mat khau moi phai it nhat 6 ky tu." };
  }

  account.password = newPassword;
  account.reset_otp = null;
  account.reset_otp_expires = null;
  await account.save();

  return { message: "Dat lai mat khau thanh cong. Ban co the dang nhap ngay." };
};

function buildResetPasswordEmailHtml({ otp, expires }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { background: #fff; max-width: 500px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #2c3e50; color: #fff; padding: 24px; text-align: center; }
    .body { padding: 24px; text-align: center; }
    .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50; background: #f0f0f0; padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 16px 0; }
    .footer { background: #f8f8f8; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>DAT LAI MAT KHAU</h2>
    </div>
    <div class="body">
      <p>Chung toi da nhan duoc yeu cau dat lai mat khau cho tai khoan nay.</p>
      <p>Ma xac minh cua ban:</p>
      <div class="otp-box">${otp}</div>
      <p>Ma co hieu luc trong <strong>${expires}</strong>. Khong chia se ma nay voi bat ky ai.</p>
      <p>Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.</p>
    </div>
    <div class="footer">
      He thong Quan Ly Phong Tro - ${new Date().toLocaleDateString("vi-VN")}
    </div>
  </div>
</body>
</html>`;
}

module.exports = { generateToken, setTokenCookie, login, changePassword, resetPassword, verifyOtpAndReset };
