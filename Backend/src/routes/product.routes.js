const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");

// ── Example controller placeholders ──────────────────
// Replace these with your real product controller imports
const getProducts = (req, res) => res.json({ message: "Get all products" });
const getProduct = (req, res) => res.json({ message: "Get single product" });
const createProduct = (req, res) => res.json({ message: "Create product" });
const updateProduct = (req, res) => res.json({ message: "Update product" });
const deleteProduct = (req, res) => res.json({ message: "Delete product" });

// ── Public routes — anyone can browse products ────────
router.get("/", getProducts);
router.get("/:id", getProduct);

// ── Protected routes — admin only ─────────────────────
// authMiddleware  → checks token is valid and not blocked
// roleMiddleware  → checks role === "admin"
router.post("/", authMiddleware, roleMiddleware("admin"), createProduct);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

module.exports = router;

// ── HOW TO USE roleMiddleware ANYWHERE ───────────────
//
// Allow only admin:
//   roleMiddleware("admin")
//
// Allow both admin and customer:
//   roleMiddleware("admin", "customer")
//
// Always put authMiddleware BEFORE roleMiddleware:
//   router.get("/orders", authMiddleware, roleMiddleware("admin"), getOrders);
