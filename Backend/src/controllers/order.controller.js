const Order = require("../models/order.modle");
const Product = require("../models/product.model");

// ─────────────────────────────────────────
// @route   POST /api/orders
// @access  Private (customer)
// ─────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must have at least one item" });
    }

    // Build order items — look up each product to capture name & price at time of order
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (!product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtOrder: product.price,
      });

      calculatedTotal += product.price * item.quantity;

      // Decrease stock
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    const order = new Order({
      customerId: req.user._id,
      items: orderItems,
      totalAmount: totalAmount || calculatedTotal,
      status: "pending",
    });

    await order.save();

    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/orders/my
// @access  Private (customer)
// ─────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate("items.productId", "name imageURL category")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/orders
// @access  Private (admin)
// ─────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate("items.productId", "name imageURL category")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
// ─────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "preparing", "ready", "collected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(", ")}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
