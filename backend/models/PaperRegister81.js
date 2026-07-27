const mongoose = require('mongoose');

const PaperRegister81Schema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  serialNumber: {
    type: String,
    required: [true, 'الرقم المسلسل مطلوب'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب']
  },
  applicantName: {
    type: String,
    required: [true, 'اسم مقدم الطلب مطلوب'],
    trim: true
  },
  requestType: {
    type: String,
    required: [true, 'نوع الطلب مطلوب'],
    trim: true
  },
  requestNumber: {
    type: String,
    default: '',
    trim: true
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

PaperRegister81Schema.index({ year: 1, serialNumber: 1 });

module.exports = mongoose.model('PaperRegister81', PaperRegister81Schema);
