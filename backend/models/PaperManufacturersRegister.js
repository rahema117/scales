const mongoose = require('mongoose');

const PaperManufacturersRegisterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'رقم الترخيص مطلوب'],
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  issueDate: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    filePath: String,
    originalName: String
  }]
}, { timestamps: true });

PaperManufacturersRegisterSchema.index({ year: 1, licenseNumber: 1 });

module.exports = mongoose.model('PaperManufacturersRegister', PaperManufacturersRegisterSchema);
