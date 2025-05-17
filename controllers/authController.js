const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);

        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        // Generate JWT token
       const token = jwt.sign(
    { user_id: user._id }, // 🟢 _id (for findById)
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);

        res.status(200).json({
            message: 'Login successful',
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




            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
