const mongoose = require('mongoose');

const PaperIncomingRegisterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  incomingNumber: {
    type: String,
    required: [true, 'رقم الوارد مطلوب'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب']
  },
  sender: {
    type: String,
    required: [true, 'اسم الجهة / الراسل مطلوب'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'الموضوع مطلوب'],
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

PaperIncomingRegisterSchema.index({ year: 1, incomingNumber: 1 });

module.exports = mongoose.model('PaperIncomingRegister', PaperIncomingRegisterSchema);
