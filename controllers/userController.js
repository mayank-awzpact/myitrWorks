const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const Blacklist = require("../models/blacklistModel");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      password,
      role,
      department,
      designation,
      joining_date,
      address,
      device_type,
      phone_brand,
      device_name,
      model_name,
      os_version,
      latitude,
      longitude,
      profile_picture,
    } = req.body;

    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Generate employee_id
    const namePart = full_name
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toLowerCase();
    const phonePart = phone_number.substring(0, 3);
    const emailPart = email.substring(0, email.indexOf("@")).toLowerCase();
    const employee_id = namePart + phonePart + emailPart;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      full_name,
      email,
      phone_number,
      password: hashedPassword,
      employee_id,
      role,
      department,
      designation,
      joining_date,
      profile_picture: profile_picture || null,
      address,
      device_type,
      phone_brand,
      device_name,
      model_name,
      os_version,
      latitude,
      longitude,
      status: true,
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.logoutUser = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(400).json({ message: "Token not found" });
  
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.email) {
        return res.status(400).json({ message: "Invalid token" });
      }
  
      const expiry = new Date(decoded.exp * 1000); // JWT exp is in seconds
      const email = decoded.email; // Extract email from decoded token
  
      await Blacklist.create({ email, token, expiredAt: expiry });
  
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  