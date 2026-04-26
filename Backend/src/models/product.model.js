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
      enum: ["Vegetables", "Fruits", "Dairy", "Daily Items", "Snacks", "Other"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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
      default: true,
    },

    // ✅ ADD THIS FIELD
    unit: {
      type: String,
      default: "kg", // default for fruits/vegetables
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);