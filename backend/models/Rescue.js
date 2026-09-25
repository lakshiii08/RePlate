const mongoose = require('mongoose');

const RescueSchema = new mongoose.Schema(
  {
    rescue_id: { type: String, required: true, unique: true, index: true },
    donationId: { type: String, required: true, index: true },
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
      default: 'MATCHED',
      index: true,
    },
    donor: {
      name: { type: String, required: true },
      email: { type: String, default: 'donor@replate.org' },
      phone: { type: String, default: '' },
      address: { type: String, required: true },
      coords: { type: [Number], required: true }, // [lat, lng]
      contactPerson: { type: String, default: 'Kitchen Lead' },
    },
    shelter: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      contactEmail: { type: String, default: 'shelter@replate.org' },
      address: { type: String, required: true },
      coords: { type: [Number], required: true }, // [lat, lng]
      contactPhone: { type: String, default: '' },
      contactPerson: { type: String, default: 'Intake Officer' },
      intakeCapacity: { type: Number, default: 100 },
    },
    driver: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      phone: { type: String, default: null },
      vehicleType: { type: String, default: null },
      vehiclePlate: { type: String, default: null },
      coords: { type: [Number], default: null },
      etaMinutes: { type: Number, default: null },
    },
    foodDetails: {
      foodName: { type: String, required: true },
      quantity: { type: String, required: true },
      quantityKg: { type: Number, default: 10 },
      mealCount: { type: Number, default: 30 },
      category: { type: String, default: 'Meal' },
      foodType: { type: String, default: 'Veg' },
      storageMethod: { type: String, default: 'ambient' },
      pickupDeadline: { type: String, required: true },
    },
    pickupOtp: { type: String, required: true },
    deliveryOtp: { type: String, required: true },
    pickupVerified: { type: Boolean, default: false },
    pickupVerifiedAt: { type: Date, default: null },
    deliveryVerified: { type: Boolean, default: false },
    deliveryVerifiedAt: { type: Date, default: null },
    route: {
      source: { type: String, default: 'mapbox' },
      distanceMeters: { type: Number, default: 0 },
      distanceKm: { type: Number, default: 0 },
      durationSeconds: { type: Number, default: 0 },
      durationMinutes: { type: Number, default: 0 },
      geometry: { type: Object, default: null }, // GeoJSON geometry or polyline
      steps: [{ instruction: String, distance: Number, duration: Number }],
    },
    telemetry: {
      temperatureCelsius: { type: Number, default: 65 },
      coldChainCompliant: { type: Boolean, default: true },
      lastPingAt: { type: Date, default: Date.now },
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        message: { type: String, required: true },
        actor: { type: String, default: 'System' },
      },
    ],
    simulationEvents: [
      {
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        reason: { type: String, default: '' },
        resolution: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Rescue || mongoose.model('Rescue', RescueSchema);
