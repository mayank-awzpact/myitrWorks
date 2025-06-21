const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user_id: { type: Number },
  email: { type: String, required: true },
  device_type: { type: String },
  phone_brand: { type: String },
  device_name: { type: String },
  model_name: { type: String },
  os_version: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  status: { type: String, enum: ["success", "failure"], required: true },
  message: { type: String },
  is_active: { type: Boolean, default: false },
  token_hash: { type: String }, // Added to track tokens for invalidation
  login_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoginActivity", loginActivitySchema);