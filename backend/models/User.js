const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['DONOR', 'SHELTER', 'DRIVER', 'ADMIN'],
      default: 'DONOR',
    },
    organization: { type: String, default: '' },
    status: { type: String, default: 'ACTIVE' },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
