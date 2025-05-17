const mongoose = require('mongoose');
const Counter = require('./Counter');
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
       user_id: { type: Number, unique: true }, // 👈 added

  seq: { type: Number, default: 0 }
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'user_id' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.user_id = counter.seq;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('User', userSchema);
