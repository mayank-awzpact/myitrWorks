// models/loginActivityModel.js
const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
  user_id: { type: Number, required: false },
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
  login_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
