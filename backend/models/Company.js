const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'اسم الشركة مطلوب'],
    trim: true,
  },
  responsiblePerson: {
    type: String,
    required: [true, 'اسم المسؤول مطلوب'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'العنوان مطلوب'],
    trim: true,
  },
  commercialRegister: {
    type: String,
    required: [true, 'رقم السجل التجاري مطلوب'],
    unique: true,
    trim: true,
  },
  taxCardNumber: {
    type: String,
    required: [true, 'رقم البطاقة الضريبية مطلوب'],
    trim: true,
  },
  lastCalibrationDate: {
    type: Date,
    required: [true, 'تاريخ آخر معايرة مطلوب'],
  },
  nextRenewalDate: {
    type: Date,
    required: [true, 'تاريخ التجديد القادم مطلوب'],
  },
  penaltyStatus: {
    type: String,
    enum: ['لا يوجد', 'متأخرة عن التجديد', 'تم تطبيق الغرامة', 'تم سداد الغرامة'],
    default: 'لا يوجد',
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
