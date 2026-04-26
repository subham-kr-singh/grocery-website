const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  me,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private routes — must be logged in
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

module.exports = router;
