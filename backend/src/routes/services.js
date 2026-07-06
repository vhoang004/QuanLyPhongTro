const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const servicesController = require("../controllers/servicesController");

router.get("/", authenticate, authorize("manager"), servicesController.getAllServices);

router.post("/", authenticate, authorize("manager"), servicesController.createService);

router.put("/:id", authenticate, authorize("manager"), servicesController.updateService);

router.delete("/:id", authenticate, authorize("manager"), servicesController.deleteService);

module.exports = router;
