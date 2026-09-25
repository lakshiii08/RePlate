const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String, default: 'Refrigerated Cargo Van (Tata Ace EV)' },
    vehiclePlate: { type: String, default: 'DL 1Z A 4920' },
    vehicleCapacityKg: { type: Number, default: 450 },
    coords: { type: [Number], default: [28.5672, 77.2100] }, // [lat, lng]
    isOnline: { type: Boolean, default: true },
    status: { type: String, enum: ['AVAILABLE', 'ON_MISSION', 'OFFLINE'], default: 'AVAILABLE' },
    rating: { type: Number, default: 4.95 },
    activeRescueId: { type: String, default: null },
    serviceRadiusKm: { type: Number, default: 20 },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Driver || mongoose.model('Driver', DriverSchema);
