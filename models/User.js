const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    employee_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'hr', 'admin'], required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joining_date: { type: Date, required: true },
    profile_picture: { type: String },
    address: { type: String },
    device_type: { type: String },
    phone_brand: { type: String },
    device_name: { type: String },
    model_name: { type: String },
    os_version: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
