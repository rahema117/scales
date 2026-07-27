const mongoose = require('mongoose');

const PaperGasStationsRegisterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  recordNumber: {
    type: String,
    required: [true, 'رقم السجل مطلوب'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب']
  },
  stationName: {
    type: String,
    required: [true, 'اسم محطة الوقود / الجهه مطلوب'],
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

PaperGasStationsRegisterSchema.index({ year: 1, recordNumber: 1 });

module.exports = mongoose.model('PaperGasStationsRegister', PaperGasStationsRegisterSchema);
