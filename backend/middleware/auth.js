const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'obour_scales_secret_key_2026'
      );

      // Get admin from the token
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'مستخدم غير مصرح له' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      res.status(401).json({ success: false, message: 'جلسة العمل انتهت، يرجى تسجيل الدخول مرة أخرى' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'غير مصرح، لا يوجد رمز دخول' });
  }
};

module.exports = { protect };
