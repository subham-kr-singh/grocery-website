const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Vegetables", "Fruits", "Dairy", "Bakery", "Snacks", "Other"],
    },
    price: {
      type: Number,
      required: true,
      min: 0, // price can never be negative
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    imageURL: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true, // removed required, default handles it
    },
  },
  { timestamps: true }, // replaces your manual updateAt field — cleaner
);

module.exports = mongoose.model("Product", productSchema);
