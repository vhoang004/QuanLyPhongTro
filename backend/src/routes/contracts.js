const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const contractController = require("../controllers/contractController");

router.get("/", authenticate, authorize("manager"), contractController.getAllContracts);

router.get("/expiring", authenticate, authorize("manager"), contractController.getExpiringContracts);

router.get("/by-room/:roomId", authenticate, authorize("manager"), contractController.getContractsByRoom);

router.get("/:id/tenants", authenticate, authorize("manager"), contractController.getContractTenants);

router.get("/available-tenants", authenticate, authorize("manager"), contractController.getAvailableTenants);

router.get("/:id", authenticate, authorize("manager"), contractController.getContractById);

router.post("/", authenticate, authorize("manager"), contractController.createContract);

router.put("/:id/renew", authenticate, authorize("manager"), contractController.renewContract);

router.put("/:id", authenticate, authorize("manager"), contractController.updateContract);

router.put("/:id/terminate", authenticate, authorize("manager"), contractController.terminateContract);

router.post("/sync-status", authenticate, authorize("manager"), contractController.syncContractRoomStatus);

module.exports = router;
