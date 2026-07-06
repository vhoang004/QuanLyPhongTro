const jwt = require("jsonwebtoken");
const { Account } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fall back to HttpOnly cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Khong co token xac thuc." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!account) {
      return res.status(401).json({ message: "Tai khoan khong ton tai." });
    }

    if (account.status !== "active") {
      return res.status(403).json({ message: "Tai khoan da bi khoa." });
    }

    req.user = account;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token da het han." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token khong hop le." });
    }
    return res.status(500).json({ message: "Loi xac thuc." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chua xac thuc." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ban khong co quyen thuc hien hanh dong nay." });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
