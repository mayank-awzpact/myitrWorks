const User = require("../models/userModel");
const LoginActivity = require("../models/LoginActivity");
const Blacklist = require("../models/blacklistModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Store login attempts temporarily (in production, use Redis or another cache)
const loginAttempts = new Map();

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

    // Create a unique device identifier
    const deviceId = `${email}:${device_name}:${model_name}`;
    
    // Check for active session on different device
    const activeSession = await LoginActivity.findOne({
      user: user._id,
      status: "success",
      is_active: true,
      device_name: { $ne: device_name }, // Different device
    });

    // Check if this is the second login attempt from this device
    const isSecondAttempt = loginAttempts.has(deviceId);

    // 🔥 FIRST HIT: Show last login activity
    if (activeSession && !isSecondAttempt) {
      // Store this attempt for 5 minutes (adjust as needed)
      loginAttempts.set(deviceId, {
        timestamp: Date.now(),
        userId: user._id
      });
      
      // Set timeout to clear this attempt after 5 minutes
      setTimeout(() => {
        loginAttempts.delete(deviceId);
      }, 5 * 60 * 1000);

      return res.status(409).json({
        success: false,
        message: `You are already logged in on another device (${activeSession.device_name}). Please try again to force logout from the other device.`,
        last_login_activity: {
          device_name: activeSession.device_name,
          device_type: activeSession.device_type,
          login_at: activeSession.login_at,
        }
      });
    }

    // 🔥 SECOND HIT or NO ACTIVE SESSION: Proceed with login
    
    // If there was an active session, invalidate its token
    if (activeSession) {
      // Find the token for the active session (if available)
      const tokenToBlacklist = await findActiveSessionToken(user._id, activeSession.device_name);
      
      if (tokenToBlacklist) {
        // Add token to blacklist with expiry
        const decoded = jwt.decode(tokenToBlacklist);
        if (decoded && decoded.exp) {
          await Blacklist.create({
            email: user.email,
            token: tokenToBlacklist,
            expiredAt: new Date(decoded.exp * 1000)
          });
        }
      }
      
      // Deactivate all previous active sessions
      await LoginActivity.updateMany(
        { user: user._id, is_active: true },
        { $set: { is_active: false } }
      );
    }

    // Clear the login attempt since we're proceeding
    loginAttempts.delete(deviceId);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
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
      message: isSecondAttempt ? "Login successful (forced from another device)" : "Login successful",
      is_active: true,
      token_hash: hashToken(token) // Store a hash of the token for future invalidation
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
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
      session_info: isSecondAttempt ? "Previous session terminated" : "New session created"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Helper function to hash tokens for storage
function hashToken(token) {
  // In production, use a proper hashing algorithm
  return require('crypto').createHash('sha256').update(token).digest('hex');
}

// Helper function to find active session token
// Note: This is a placeholder. In a real implementation, you would need to 
// store token hashes with login activities to properly identify them
async function findActiveSessionToken(userId, deviceName) {
  // This is a simplified implementation
  // In a real app, you would need to store token references with login activities
  const activity = await LoginActivity.findOne({
    user: userId,
    device_name: deviceName,
    is_active: true
  });
  
  // This is just a placeholder - in reality you'd need to retrieve the actual token
  // or its hash from wherever you store it
  return activity?.token_hash ? null : null;
}

// Add this to your LoginActivity schema
// token_hash: { type: String }