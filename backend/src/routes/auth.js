const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const authController = require("../controllers/authController");

router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ message: "Dang xuat thanh cong." });
});

router.post("/reset-password", authController.verifyResetOtp);

router.post("/change-password", authenticate, authController.changePassword);

router.get("/profile", authenticate, authController.getProfile);

router.put("/profile", authenticate, authController.updateProfile);

router.get("/accounts", authenticate, authorize("admin"), authController.getAllAccounts);

router.post("/accounts", authenticate, authorize("admin"), authController.createAccount);

router.put("/accounts/:id", authenticate, authorize("admin"), authController.updateAccount);

router.delete("/accounts/:id", authenticate, authorize("admin"), authController.deleteAccount);

module.exports = router;
