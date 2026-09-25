const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    foodName: { type: String, required: true },
    quantity: { type: String, required: true },
    quantityKg: { type: Number, default: 10 },
    mealCount: { type: Number, default: 30 },
    category: {
      type: String,
      enum: [
        'Meal',
        'Bakery',
        'Fruits',
        'Other',
        'Cooked Meal',
        'Bakery & Bread',
        'Fresh Produce',
        'Packaged Goods',
        'Dairy & Refrigerated',
        'Catered Buffet',
      ],
      default: 'Meal',
    },
    foodType: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
    storageMethod: {
      type: String,
      enum: ['hot_held', 'refrigerated', 'ambient', 'frozen'],
      default: 'ambient',
    },
    packagingType: {
      type: String,
      enum: ['sealed', 'covered', 'individual_containers', 'bulk_boxes'],
      default: 'sealed',
    },
    donorName: { type: String, required: true },
    donorPhone: { type: String, default: '+91 98100 12345' },
    donorAddress: { type: String, default: 'Green Park Market, New Delhi' },
    donorCoords: { type: [Number], default: [28.5589, 77.2028] }, // [lat, lng]
    pickupLocation: { type: String, default: 'Green Park Market, New Delhi' },
    pickupDeadline: { type: String, required: true },
    preparedTime: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'POSTED',
        'VERIFIED',
        'MATCHING',
        'MATCHED',
        'DRIVER_ASSIGNED',
        'PICKUP_IN_PROGRESS',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED',
        'RE_MATCHING',
      ],
      default: 'POSTED',
      index: true,
    },
    matchedShelterId: { type: String, default: null },
    assignedDriverId: { type: String, default: null },
    donorEmail: { type: String, default: 'donor@replate.org' },
    recipientEmail: { type: String, default: 'shelter@replate.org' },
    pickupOtp: { type: String, default: null },
    deliveryOtp: { type: String, default: null },
    specialNotes: { type: String, default: '' },
    dietaryFlags: [{ type: String }],
    photoUrl: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
