const express = require("express");
const router = express.Router();

// ❌ Temporarily removed auth middleware
// const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

// ── Public routes ───────────────
router.get("/", getProducts);
router.get("/:id", getProduct);

// ── TEMP: Make all routes public (for testing) ─────────
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;