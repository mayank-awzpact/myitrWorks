const Punch = require("../models/punchModel");
const User = require("../models/userModel");
const moment = require("moment");

const OFFICE_LAT = 28.6139;
const OFFICE_LNG = 77.209;
const MAX_DISTANCE = 100; // in meters

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of Earth in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.punchIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.user_id; // MongoDB ObjectId

    // Fetch user info by id
    const user = await User.findById(userId).select(
      "full_name email role user_id"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Distance validation logic here (not shown for brevity)...

    const today = moment().format("YYYY-MM-DD");

    // Check if punch in exists for today
    const existingPunch = await Punch.findOne({ user: userId, date: today });
    if (existingPunch && existingPunch.punch_in) {
      return res.status(400).json({
        success: false,
        message: "You already punched in today",
      });
    }

    // Create punch with user ref + user info
    const punch = new Punch({
      user: user._id,
      user_info: {
        user_id: user.user_id, // numeric id if any in your User model
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      punch_in: new Date(),
      date: today,
      location: { latitude, longitude },
    });

    await punch.save();

    return res.status(200).json({
      success: true,
      message: "Punch in successful",
      data: punch,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.punchOut = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const today = moment().format("YYYY-MM-DD");
    const punch = await Punch.findOne({ user: userId, date: today });
    if (!punch || !punch.punch_in) {
      return res.status(400).json({ message: "You need to punch in first" });
    }

    if (punch.punch_out) {
      return res.status(400).json({ message: "Already punched out today" });
    }

    punch.punch_out = new Date();
    await punch.save();

    return res.status(200).json({
      success: true,
      message: "Punch out successful",
      data: punch,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
