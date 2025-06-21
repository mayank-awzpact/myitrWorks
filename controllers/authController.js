const User = require("../models/userModel");
const LoginActivity = require("../models/LoginActivity");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const requiredFields = [
      "email",
      "password",
      "device_type",
      "phone_brand",
      "device_name",
      "model_name",
      "os_version",
      "latitude",
      "longitude",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "The following fields are required:",
        missing_fields: missingFields,
      });
    }

    const {
      email,
      password,
      device_type,
      phone_brand,
      device_name,
      model_name,
      os_version,
      latitude,
      longitude,
    } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      await LoginActivity.create({
        email,
        device_type,
        phone_brand,
        device_name,
        model_name,
        os_version,
        latitude,
        longitude,
        status: "failure",
        message: "User not found",
      });

      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginActivity.create({
        user: user._id,
        user_id: user.user_id,
        email,
        device_type,
        phone_brand,
        device_name,
        model_name,
        os_version,
        latitude,
        longitude,
        status: "failure",
        message: "Invalid password",
      });

      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { user_id: user._id, email: user.email }, // Combined payload
      process.env.JWT_SECRET,                   // Secret
      { expiresIn: process.env.JWT_EXPIRES_IN } // Options
    );
    // Log successful login activity
    await LoginActivity.create({
      user: user._id,
      user_id: user.user_id,
      email,
      device_type,
      phone_brand,
      device_name,
      model_name,
      os_version,
      latitude,
      longitude,
      status: "success",
      message: "Login successful",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number,
        department: user.department,
        designation: user.designation,
        joining_date: user.joining_date,
        address: user.address,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
