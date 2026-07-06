const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const debtController = require("../controllers/debtController");

router.get("/", authenticate, authorize("manager"), debtController.getAllDebts);

router.get("/summary", authenticate, authorize("manager"), debtController.getDebtSummary);

router.get("/:id", authenticate, authorize("manager"), debtController.getDebtDetails);

router.post("/adjustments", authenticate, authorize("manager"), debtController.createAdjustment);

router.delete("/adjustments/:id", authenticate, authorize("manager"), debtController.deleteAdjustment);

module.exports = router;
