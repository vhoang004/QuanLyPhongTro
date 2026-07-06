const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const ownerConfigController = require("../controllers/ownerConfigController");

router.get("/", authenticate, authorize("manager"), ownerConfigController.getConfig);

router.put("/", authenticate, authorize("manager"), ownerConfigController.updateConfig);

module.exports = router;
