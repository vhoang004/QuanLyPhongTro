const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const invoiceController = require("../controllers/invoiceController");

router.get("/", authenticate, authorize("manager"), invoiceController.getAllInvoices);

router.get("/:id", authenticate, authorize("manager"), invoiceController.getInvoiceById);

router.post("/", authenticate, authorize("manager"), invoiceController.generateInvoice);

router.post("/batch", authenticate, authorize("manager"), invoiceController.generateBatchInvoices);

router.post("/:id/qr", authenticate, authorize("manager"), invoiceController.generateQRCode);

module.exports = router;
