const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

exports.registerUser = async (req, res) => {
    try {
        const {
            full_name, email, phone_number, password, role,
            department, designation, joining_date, address,
            device_type, phone_brand, device_name, model_name,
            os_version, latitude, longitude, profile_picture
        } = req.body;

        // Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Generate employee_id
        const namePart = full_name.replace(/\s+/g, '').substring(0, 3).toLowerCase();
        const phonePart = phone_number.substring(0, 3);
        const emailPart = email.substring(0, email.indexOf('@')).toLowerCase();
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
            status: true
        });

        await user.save();
         res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};


