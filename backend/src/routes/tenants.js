const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const tenantController = require("../controllers/tenantController");

router.get("/", authenticate, authorize("manager"), tenantController.getAllTenants);

router.get("/:id", authenticate, authorize("manager"), tenantController.getTenantById);

router.get("/:id/history", authenticate, authorize("manager"), tenantController.getTenantHistory);

router.post("/", authenticate, authorize("manager"), tenantController.createTenant);

router.put("/:id", authenticate, authorize("manager"), tenantController.updateTenant);

router.delete("/:id", authenticate, authorize("manager"), tenantController.deleteTenant);

module.exports = router;
