const mongoose = require("mongoose");

const punchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_info: {
    user_id: Number,
    full_name: String,
    email: String,
    role: String,
  },
  punch_in: Date,
  punch_out: Date,
  date: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
});

module.exports = mongoose.model("Punch", punchSchema);
