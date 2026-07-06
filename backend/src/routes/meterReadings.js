const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const meterReadingController = require("../controllers/meterReadingController");

router.get("/", authenticate, authorize("manager"), meterReadingController.getAllMeterReadings);

router.get("/room/:room_id", authenticate, authorize("manager"), meterReadingController.getMeterReadingByRoom);

router.get("/services", authenticate, authorize("manager"), meterReadingController.getServicePriceList);

router.get("/rooms", authenticate, authorize("manager"), meterReadingController.getRoomsForMeterReading);

router.post("/", authenticate, authorize("manager"), meterReadingController.recordMeterReading);

router.post("/batch", authenticate, authorize("manager"), meterReadingController.recordBatchMeterReadings);

module.exports = router;
