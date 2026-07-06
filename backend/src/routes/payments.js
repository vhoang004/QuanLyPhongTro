const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const paymentController = require("../controllers/paymentController");

router.get("/", authenticate, authorize("manager"), paymentController.getAllPayments);

router.get("/invoice/:invoice_id", authenticate, authorize("manager"), paymentController.getPaymentsByInvoice);

router.post("/", authenticate, authorize("manager"), paymentController.recordPayment);

router.post("/confirm/:id", authenticate, authorize("manager"), paymentController.confirmPayment);

module.exports = router;
