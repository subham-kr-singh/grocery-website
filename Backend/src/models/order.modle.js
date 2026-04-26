const mongoose = require("mongoose");

// each item inside the order
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true, // store name at time of order (product name may change later)
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtOrder: {
    type: Number,
    required: true, // store price at time of order (price may change later)
  },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (val) => val.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "collected"],
      default: "pending",
    },
    estimatedPickupTime: {
      type: String, // e.g. "15-20 minutes" or a specific time string
      default: "15-20 minutes",
    },
  },
  { timestamps: true }, // createdAt = when order was placed
);

module.exports = mongoose.model("Order", orderSchema);
