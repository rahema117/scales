const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    // Check for admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'بيانات الاعتماد غير صالحة' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'بيانات الاعتماد غير صالحة' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'obour_scales_secret_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ في خادم النظام' });
  }
});

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

module.exports = router;
