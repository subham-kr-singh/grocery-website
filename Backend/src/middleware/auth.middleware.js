const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const blockedTokenModel = require("../models/blockedToken.model");

// ─────────────────────────────────────────
// AUTH MIDDLEWARE
// Verifies JWT token from cookie or header
// Attaches req.user for downstream use
// ─────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token — check cookie first, then Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. No token at all
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // 3. Check if token is blocked (logged out)
    const isBlocked = await blockedTokenModel.findOne({ token });
    if (isBlocked) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // 4. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Check user still exists in DB
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 6. Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    // Handle specific JWT errors clearly
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────
// ROLE MIDDLEWARE — Factory function
// Usage: roleMiddleware("admin")
//        roleMiddleware("admin", "customer")
// ─────────────────────────────────────────
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware must run before this
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for: ${allowedRoles.join(", ")} only.`,
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };