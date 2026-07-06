const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const roomController = require("../controllers/roomController");
const upload = require("../middlewares/upload");

router.get("/", authenticate, authorize("manager"), roomController.getAllRooms);

router.get("/stats", authenticate, authorize("manager"), roomController.getRoomStats);

router.get("/stats/types", authenticate, authorize("manager"), roomController.getRoomTypesStats);

router.get("/:id", authenticate, authorize("manager"), roomController.getRoomById);

router.post("/", authenticate, authorize("manager"), roomController.createRoom);

router.put("/:id", authenticate, authorize("manager"), roomController.updateRoom);

router.delete("/:id", authenticate, authorize("manager"), roomController.deleteRoom);

router.post("/sync-status", authenticate, authorize("manager"), roomController.syncRoomStatus);

router.post(
  "/:id/images",
  authenticate,
  authorize("manager"),
  upload.array("images", 10),
  roomController.uploadRoomImages
);

router.delete("/:id/images/:imageIndex", authenticate, authorize("manager"), roomController.deleteRoomImage);

module.exports = router;
