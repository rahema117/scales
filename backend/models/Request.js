const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  requestType: {
    type: String,
    enum: ['company', 'fuel_station', 'fuel_tanker'],
    default: 'company',
  },
  companyName: {
    type: String,
    required: [true, 'اسم المنشأة/الشركة مطلوب'],
    trim: true,
  },
  responsiblePerson: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  commercialRegister: {
    type: String,
    trim: true,
  },
  taxCardNumber: {
    type: String,
    trim: true,
  },
  scalesCount: {
    type: Number,
  },
  scalesTypes: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: [
      'تم استلام الطلب',
      'تمت مراجعة الطلب',
      'قيد المراجعة',
      'مستندات ناقصة',
      'تحديد زيارة مكتب العبور لإتمام الدفع',
      'تم الدفع',
      'تحديد موعد الزيارة والدمغ والمعايرة',
      'تم تحديد موعد',
      'تم تنفيذ الدمغ والمعايرة',
      'مرفوض'
    ],
    default: 'تم استلام الطلب',
  },
  paymentVisitDate: {
    type: String,
    trim: true,
  },
  paymentVisitTime: {
    type: String,
    trim: true,
  },
  paymentFee: {
    type: String,
    trim: true,
  },
  paymentCompleted: {
    type: Boolean,
    default: false,
  },
  calibrationVisitDate: {
    type: String,
    trim: true,
  },
  calibrationVisitTime: {
    type: String,
    trim: true,
  },
  calibrationCompleted: {
    type: Boolean,
    default: false,
  },
  appointmentDate: {
    type: String,
    trim: true,
  },
  appointmentTime: {
    type: String,
    trim: true,
  },
  adminNotes: {
    type: String,
    trim: true,
    default: '',
  },
  files: {
    requestFile: { type: String },
    authorizationFile: { type: String },
    commercialRegisterFile: { type: String },
    taxCardFile: { type: String },
    calibrationCertificateFile: { type: String },
    vehicleLicenseFile: { type: String },
    trailerLicenseFile: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
