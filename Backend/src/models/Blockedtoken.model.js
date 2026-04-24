const mongoose = require("mongoose");

// Every logged-out token gets stored here
// MongoDB TTL index auto-deletes documents after 24h
const blockedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // 86400 seconds = 24 hours — MongoDB auto-deletes after this
  },
});

module.exports = mongoose.model("BlockedToken", blockedTokenSchema);
