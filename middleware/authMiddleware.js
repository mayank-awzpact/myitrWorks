const jwt = require('jsonwebtoken');
const Blacklist = require('../models/blacklistModel');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 🔍 Check if token is blacklisted
        const isBlacklisted = await Blacklist.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token has been logged out. Please login again.' });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
