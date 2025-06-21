const mongoose = require("mongoose");

const BlacklistSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiredAt: { type: Date, required: true }, // Set based on JWT expiry
});

module.exports = mongoose.model("Blacklist", BlacklistSchema);
