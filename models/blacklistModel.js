const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiredAt: { type: Date, required: true } // Set based on JWT expiry
});

module.exports = mongoose.model('Blacklist', BlacklistSchema);