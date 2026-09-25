const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    role: { type: String, default: 'DONOR' },
    name: { type: String, default: '' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-expire from MongoDB
  },
  { timestamps: true }
);

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
