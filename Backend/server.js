const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // parses req.cookies
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config(); // must be first before anything reads process.env

const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const orderRoutes = require("./src/routes/order.routes");

const app = express();

// ── Middleware — ORDER MATTERS, must come before routes ───
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500", // Live Server URL
    credentials: true, // REQUIRED — allows cookies to be sent cross-origin
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // populates req.cookies — must be before routes that read cookies
app.use(morgan("dev")); // logs every request in terminal

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: err.message,
  });
});

// ── Connect DB then Start Server ──────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
