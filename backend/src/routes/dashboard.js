const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/", authenticate, authorize("manager"), dashboardController.getDashboard);

router.get("/revenue", authenticate, authorize("manager"), dashboardController.getRevenueStats);

router.get("/debt", authenticate, authorize("manager"), dashboardController.getDebtStats);

router.get("/export-pdf/:id", authenticate, authorize("manager"), dashboardController.exportInvoicePDF);

router.post("/send-email/:id", authenticate, authorize("manager"), dashboardController.sendInvoiceEmailController);

module.exports = router;
