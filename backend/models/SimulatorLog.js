const mongoose = require('mongoose');

const SimulatorLogSchema = new mongoose.Schema(
  {
    simulationId: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['DRIVER_CANCEL', 'SHELTER_FULL', 'ROUTE_DELAY'],
      required: true,
    },
    rescueId: { type: String, required: true, index: true },
    reason: { type: String, default: '' },
    details: { type: Object, default: {} },
    previousState: { type: Object, default: {} },
    newState: { type: Object, default: {} },
    mitigationActions: [{ type: String }],
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SimulatorLog || mongoose.model('SimulatorLog', SimulatorLogSchema);
