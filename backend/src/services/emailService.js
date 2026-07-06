const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return null;
};

const sendInvoiceEmail = async ({ to, subject, html, attachments = [], qrImageBase64, qrImageBuffer }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email not configured. Skipping email send.");
    return { sent: false, message: "Email chua duoc cau hinh." };
  }

  const mailAttachments = [...attachments];
  const qrBuffer = qrImageBuffer;
  const hasQr = Boolean(qrBuffer || qrImageBase64);

  if (hasQr) {
    mailAttachments.push({
      filename: "qr-vietqr.png",
      content: qrBuffer,
      contentType: "image/png",
      cid: "qr-vietqr@qlpt",
    });
  }

  try {
    console.log(`[EMAIL] Bat dau gui den: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Attachment PDF size: ${Buffer.byteLength(attachments.find(a => a.filename?.endsWith('.pdf'))?.content || Buffer.alloc(0))} bytes`);
    const info = await transporter.sendMail({
      from: `"QLPT System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: mailAttachments,
    });
    console.log(`[EMAIL] Da gui thanh cong den ${to}, MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] Gui that bai den ${to}:`, error.code, error.message);
    if (error.response) console.error(`[EMAIL] SMTP Response:`, error.response);
    throw { status: 500, message: "Gui email that bai.", error: error.message };
  }
};

const buildInvoiceEmailHtml = ({ invoice, tenant, room, owner, totalAmount, qrData, details = [] }) => {
  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const monthLabel = invoice.billing_month ? invoice.billing_month.split("-").reverse().join("/") : "";
  const hasQr = !!qrData?.qrImageBase64;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { background: #fff; max-width: 650px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: #fff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .body { padding: 24px; }
    .info-section { background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .section-title { font-weight: 700; color: #2c3e50; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 6px 0; }
    .info-table .label { font-weight: 600; color: #555; width: 40%; }
    .info-table .value { color: #222; font-weight: 500; }
    .amount-section { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 10px; padding: 16px; margin: 16px 0; text-align: center; }
    .amount-label { font-size: 13px; color: #2e7d32; margin-bottom: 4px; }
    .amount-value { font-size: 26px; font-weight: 800; color: #1b5e20; }
    .qr-section { text-align: center; margin: 20px 0; }
    .qr-section img { max-width: 200px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .bank-info { background: #fff3e0; border-radius: 10px; padding: 16px; margin: 16px 0; }
    .bank-info .bank-title { font-weight: 700; color: #e65100; margin-bottom: 8px; }
    .bank-info .stk { font-size: 18px; font-weight: 700; color: #1565c0; letter-spacing: 1px; }
    .bank-info .bank-name { color: #555; font-size: 13px; }
    .note { background: #fffde7; border-left: 4px solid #fbc02d; padding: 12px; border-radius: 0 8px 8px 0; font-size: 13px; color: #666; margin-top: 16px; }
    .footer { background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>HOA DON THANH TOAN TIEN PHONG</h2>
      <p>Ma hoa don: HD-${String(invoice.id).padStart(5, "0")} - Thang ${monthLabel}</p>
    </div>
    <div class="body">
      <p>Xin chao <strong>${tenant?.full_name || "Quy khach"}</strong>,</p>
      <p>He thong Quan Ly Phong Tro gui ban hoa don thanh toan tien phong thang ${monthLabel}. Vui long kiem tra va thanh toan dung han.</p>

      <div class="info-section">
        <div class="section-title">Thong Tin Phong</div>
        <table class="info-table">
          <tr><td class="label">Phong:</td><td class="value"><strong>${room?.room_number || "-"}</strong></td></tr>
          <tr><td class="label">Chu tro:</td><td class="value">${owner?.owner_name || "-"}</td></tr>
        </table>
      </div>

      <div class="amount-section">
        <div class="amount-label">So tien can thanh toan</div>
        <div class="amount-value">${formatVND(totalAmount)}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">Trang thai: ${invoice.status === "paid" ? "Da thanh toan" : "Chua thanh toan"}</div>
      </div>

      ${hasQr ? `
      <div class="qr-section">
        <p style="font-size: 13px; color: #666; margin-bottom: 12px;">Quet ma QR de thanh toan nhanh chong</p>
        <img src="cid:qr-vietqr@qlpt" alt="QR Code Thanh Toan" />
      </div>

      <div class="bank-info">
        <div class="bank-title">Thong Tin Tai Khoan Nhan Tien</div>
        <div class="bank-name">${qrData.bank_name || "-"}</div>
        <div class="stk">${qrData.account_no || "-"}</div>
        <div style="font-size: 13px; color: #666; margin-top: 4px;">Ten TK: ${qrData.account_name || "-"}</div>
        ${qrData.amount ? `<div style="font-size: 13px; color: #d32f2f; margin-top: 4px;">So tien: <strong>${formatVND(qrData.amount)}</strong></div>` : ""}
        ${qrData.description ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">Noi dung: <em>${qrData.description}</em></div>` : ""}
      </div>
      ` : ""}

      <div class="note">
        <strong>Luu y:</strong> Vui long ghi dung noi dung chuyen khoan: <strong>${room?.room_number || "PHONG"} ${monthLabel}</strong> de chung toi xac nhan thanh toan.
      </div>

      <p style="margin-top: 20px;">Neu co thac mac, vui long lien he chu tro.</p>
      <p>Cam on! 💚</p>
    </div>
    <div class="footer">
      He thong Quan Ly Phong Tro - Tu dong gui ngay ${new Date().toLocaleDateString("vi-VN")}
    </div>
  </div>
</body>
</html>`;
};

module.exports = { sendInvoiceEmail, buildInvoiceEmailHtml };
