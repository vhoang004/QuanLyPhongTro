const Printer = require("pdfmake/js/Printer").default;
const pdfmake = require("pdfmake/build/pdfmake");
const path = require("path");
const fs = require("fs");

// Extract URLResolver class from the bundle and instantiate it with virtualfs
const bundle = fs.readFileSync(path.join(__dirname, "..", "..", "node_modules", "pdfmake", "build", "pdfmake.js"), "utf8");
const urlResolverStart = bundle.indexOf("class URLResolver");
const urlResolverEnd = bundle.indexOf("\n}", urlResolverStart);
const urlResolverDef = bundle.substring(urlResolverStart, urlResolverEnd + 2);
// eslint-disable-next-line no-eval
const URLResolver = eval("(function() { " + urlResolverDef + "; return URLResolver; })()");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "..", "..", "node_modules", "pdfmake", "fonts", "Roboto", "Roboto-Regular.ttf"),
    bold: path.join(__dirname, "..", "..", "node_modules", "pdfmake", "fonts", "Roboto", "Roboto-Medium.ttf"),
    italics: path.join(__dirname, "..", "..", "node_modules", "pdfmake", "fonts", "Roboto", "Roboto-Regular.ttf"),
    bolditalics: path.join(__dirname, "..", "..", "node_modules", "pdfmake", "fonts", "Roboto", "Roboto-Regular.ttf"),
  },
};

const resolver = new URLResolver(pdfmake.virtualfs);
const printer = new Printer(fonts, pdfmake.virtualfs, resolver, pdfmake.localAccessPolicy);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const generateInvoicePDF = async (invoiceData) => {
  const {
    invoice,
    contract,
    tenant,
    room,
    details,
    owner,
    qrData,
    payments,
  } = invoiceData;

  const roomTypeLabel = (type) => {
    if (type === "standard") return "Tiêu chuẩn";
    if (type === "deluxe") return "Cao cấp";
    if (type === "suite") return "Căn hộ";
    return type || "N/A";
  };

  const tableBody = [
    [
      { text: "Dịch vụ", style: "tableHeader" },
      { text: "Số lượng", style: "tableHeader" },
      { text: "Đơn giá", style: "tableHeader" },
      { text: "Thành tiền", style: "tableHeader" },
    ],
    [
      "Tiền phòng",
      "1 tháng",
      formatCurrency(invoice.room_price),
      formatCurrency(invoice.room_price),
    ],
  ];

  if (invoice.electricity_amount > 0) {
    tableBody.push([
      "Tiền điện",
      "-",
      "-",
      formatCurrency(invoice.electricity_amount),
    ]);
  }

  if (invoice.water_amount > 0) {
    tableBody.push([
      "Tiền nước",
      "-",
      "-",
      formatCurrency(invoice.water_amount),
    ]);
  }

  if (details && details.length > 0) {
    for (const detail of details) {
      tableBody.push([
        detail.service?.service_name || "Dịch vụ",
        `${detail.quantity} ${detail.service?.unit || ""}`,
        formatCurrency(detail.unit_price),
        formatCurrency(detail.subtotal),
      ]);
    }
  }

  if (invoice.adjustment_amount !== 0) {
    const adjLabel = parseFloat(invoice.adjustment_amount) > 0 ? "Phụ phí" : "Giảm trừ";
    tableBody.push([adjLabel, "-", "-", formatCurrency(Math.abs(invoice.adjustment_amount))]);
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [50, 50, 50, 50],
    content: [
      { text: "HÓA ĐƠN THANH TOÁN", style: "title" },
      {
        columns: [
          { text: `Mã hóa đơn: HD-${String(invoice.id).padStart(5, "0")}`, width: "*" },
          { text: `Kỳ: ${invoice.billing_month}`, width: "auto" },
        ],
      },
      { text: `Ngày tạo: ${formatDate(invoice.created_at)}`, margin: [0, 0, 0, 10] },

      { text: "THÔNG TIN CHỦ TRỌ", style: "sectionHeader" },
      {
        text: [
          { text: "Tên: ", bold: true },
          `${owner?.owner_name || "Chưa cấu hình"}\n`,
          { text: "Số tài khoản: ", bold: true },
          `${owner?.bank_account || "N/A"}\n`,
          { text: "Ngân hàng: ", bold: true },
          `${owner?.bank_name || "N/A"}\n`,
          { text: "Chi nhánh: ", bold: true },
          `${owner?.bank_branch || "N/A"}`,
        ],
        margin: [0, 0, 0, 10],
      },

      { text: "THÔNG TIN NGƯỜI THUÊ", style: "sectionHeader" },
      {
        text: [
          { text: "Họ tên: ", bold: true },
          `${tenant?.full_name || "N/A"}\n`,
          { text: "Số CCCD: ", bold: true },
          `${tenant?.citizen_id || "N/A"}\n`,
          { text: "Điện thoại: ", bold: true },
          `${tenant?.phone_number || "N/A"}\n`,
          { text: "Email: ", bold: true },
          `${tenant?.email || "N/A"}\n`,
          { text: "Địa chỉ: ", bold: true },
          `${tenant?.address || "N/A"}`,
        ],
        margin: [0, 0, 0, 10],
      },

      { text: "THÔNG TIN PHÒNG", style: "sectionHeader" },
      {
        text: [
          { text: "Số phòng: ", bold: true },
          `${room?.room_number || "N/A"}\n`,
          { text: "Loại phòng: ", bold: true },
          `${roomTypeLabel(room?.room_type)}\n`,
          { text: "Diện tích: ", bold: true },
          `${room?.area || "N/A"} m²`,
        ],
        margin: [0, 0, 0, 10],
      },

      { text: "CHI TIẾT", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto"],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
      },

      {
        columns: [
          { text: "TỔNG CỘNG:", style: "totalLabel", width: "*" },
          { text: formatCurrency(invoice.total_amount), style: "totalValue", width: "auto" },
        ],
        margin: [0, 10, 0, 0],
      },
    ],

    footer: (currentPage, pageCount) => ({
      text: `Trang ${currentPage} / ${pageCount}  -  Hệ thống Quản Lý Phòng Trọ`,
      alignment: "center",
      fontSize: 8,
      color: "gray",
      margin: [0, 10, 0, 0],
    }),

    styles: {
      title: { fontSize: 20, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
      sectionHeader: { fontSize: 11, bold: true, margin: [0, 5, 0, 3] },
      tableHeader: { bold: true, fontSize: 9 },
      totalLabel: { fontSize: 12, bold: true },
      totalValue: { fontSize: 12, bold: true },
    },
  };

  return new Promise((resolve, reject) => {
    printer.createPdfKitDocument(docDefinition)
      .then((pdfDoc) => {
        const chunks = [];
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", reject);
        pdfDoc.end();
      })
      .catch(reject);
  });
};

module.exports = { generateInvoicePDF };
