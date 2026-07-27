const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'موضوع الرسالة مطلوب'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'محتوى الرسالة مطلوب'],
    trim: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
