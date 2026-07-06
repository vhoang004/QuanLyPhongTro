require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const { sequelize } = require("./src/models");
const { errorHandler, notFound } = require("./src/middlewares/errorHandler");

const authRoutes = require("./src/routes/auth");
const roomRoutes = require("./src/routes/rooms");
const tenantRoutes = require("./src/routes/tenants");
const contractRoutes = require("./src/routes/contracts");
const meterReadingRoutes = require("./src/routes/meterReadings");
const invoiceRoutes = require("./src/routes/invoices");
const paymentRoutes = require("./src/routes/payments");
const ownerConfigRoutes = require("./src/routes/ownerConfig");
const dashboardRoutes = require("./src/routes/dashboard");
const debtRoutes = require("./src/routes/debts");
const servicesRoutes = require("./src/routes/services");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
});

app.get("/", (req, res) => {
  res.json({
    message: "QLPT API Server",
    version: "2.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      rooms: "/api/rooms",
      tenants: "/api/tenants",
      contracts: "/api/contracts",
      meterReadings: "/api/meter-readings",
      invoices: "/api/invoices",
      payments: "/api/payments",
      ownerConfig: "/api/owner-config",
      dashboard: "/api/dashboard",
      debts: "/api/debts",
      services: "/api/services",
    },
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/meter-readings", meterReadingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/owner-config", ownerConfigRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/services", servicesRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected: " + process.env.DB_NAME);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    console.log("⚠️  Server will start without database connection.");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (DB disconnected)`);
    });
  }
};

startServer();
