const mongoose = require('mongoose');

const ShelterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    coords: { type: [Number], required: true }, // [lat, lng]
    capacityMeals: { type: Number, required: true, default: 100 },
    currentNeeds: [{ type: String }],
    contactPhone: { type: String, default: '+91 98765 00000' },
    dietaryPreferences: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'FULL', 'OFFLINE'], default: 'ACTIVE' },
    intakeInstructions: { type: String, default: 'Deliver to loading bay 2, ring buzzer.' },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Shelter || mongoose.model('Shelter', ShelterSchema);
