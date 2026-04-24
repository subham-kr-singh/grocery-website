const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"], // changed "user" → "customer" to match your system
      default: "customer",
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
