const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @desc    Submit contact message
// @route   POST /api/messages
// @access  Public
router.post('/', async (req, res) => {
  const { name, phone, subject, message } = req.body;

  try {
    if (!name || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول المطلوبة' });
    }

    const newMessage = new Message({
      name,
      phone,
      subject,
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتكم بنجاح. شكرًا لتواصلكم معنا.'
    });
  } catch (error) {
    console.error('Contact message error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

module.exports = router;
