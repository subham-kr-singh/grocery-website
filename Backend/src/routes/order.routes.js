const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// ── Customer routes ──────────────────────────────────────
// POST /api/orders          — place a new order
router.post("/", authMiddleware, roleMiddleware("customer", "admin"), createOrder);

// GET  /api/orders/my       — get logged-in user's own orders
// NOTE: /my must be before /:id so Express doesn't treat "my" as an ID
router.get("/my", authMiddleware, getMyOrders);

// ── Admin routes ─────────────────────────────────────────
// GET  /api/orders          — get all orders
router.get("/", authMiddleware, roleMiddleware("admin"), getAllOrders);

// PUT  /api/orders/:id/status — update order status
router.put("/:id/status", authMiddleware, roleMiddleware("admin"), updateOrderStatus);

module.exports = router;