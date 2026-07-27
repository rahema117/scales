const mongoose = require('mongoose');

const OfficeRegisterYearSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'companies',
      'gas_stations',
      'bascul_scales',
      'register_81',
      'incoming_register',
      'weights_manufacturers',
      'weighers'
    ]
  },
  year: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Ensure unique year per category
OfficeRegisterYearSchema.index({ category: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('OfficeRegisterYear', OfficeRegisterYearSchema);
