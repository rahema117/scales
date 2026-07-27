const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

// Middleware to automatically update overdue companies
const checkOverdueCompanies = async (req, res, next) => {
  try {
    const now = new Date();
    // Mark as "متأخرة عن التجديد" if renewal date is passed and status is "لا يوجد"
    await Company.updateMany(
      {
        nextRenewalDate: { $lt: now },
        penaltyStatus: 'لا يوجد'
      },
      {
        $set: { penaltyStatus: 'متأخرة عن التجديد' }
      }
    );
    next();
  } catch (error) {
    console.error('Error auto-updating overdue status:', error.message);
    next();
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Admin)
router.get('/', protect, checkOverdueCompanies, async (req, res) => {
  try {
    const companies = await Company.find().sort({ nextRenewalDate: 1 });
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Get single company history
// @route   GET /api/companies/:id/history
// @access  Private (Admin)
router.get('/:id/history', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'الشركة غير موجودة' });
    }

    // Retrieve all requests by Commercial Register to build history
    const requests = await Request.find({ commercialRegister: company.commercialRegister })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        company,
        history: requests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Add company manually (Legacy government records)
// @route   POST /api/companies
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const {
    companyName,
    phone,
    address,
    commercialRegister,
    taxCardNumber,
    responsiblePerson,
    lastCalibrationDate,
    penaltyStatus
  } = req.body;

  try {
    if (!companyName || !commercialRegister || !phone || !lastCalibrationDate) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الشركة، السجل التجاري، الهاتف، وتاريخ آخر معايرة' });
    }

    // Check if commercial register already exists
    const existing = await Company.findOne({ commercialRegister: commercialRegister.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'رقم السجل التجاري مسجل بالفعل لشركة أخرى' });
    }

    // Calculate next renewal date = last calibration date + 1 year
    const calDate = new Date(lastCalibrationDate);
    const renDate = new Date(calDate);
    renDate.setFullYear(renDate.getFullYear() + 1);

    // Determine initial penalty status if next renewal date has already passed
    const now = new Date();
    let initialPenalty = penaltyStatus || 'لا يوجد';
    if (renDate < now && initialPenalty === 'لا يوجد') {
      initialPenalty = 'متأخرة عن التجديد';
    }

    const newCompany = new Company({
      companyName,
      commercialRegister: commercialRegister.trim(),
      phone,
      address: address || 'سجل ورقي - غير محدد',
      taxCardNumber: taxCardNumber || 'سجل ورقي - غير محدد',
      responsiblePerson: responsiblePerson || 'سجل ورقي - غير محدد',
      lastCalibrationDate: calDate,
      nextRenewalDate: renDate,
      penaltyStatus: initialPenalty
    });

    await newCompany.save();
    res.status(201).json({ success: true, message: 'تم إضافة الشركة يدويًا بنجاح', data: newCompany });
  } catch (error) {
    console.error('Manual company addition error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'خطأ داخلي في الخادم' });
  }
});

// @desc    Edit company details (including penalties)
// @route   PUT /api/companies/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const {
    companyName,
    responsiblePerson,
    phone,
    address,
    commercialRegister,
    taxCardNumber,
    lastCalibrationDate,
    penaltyStatus
  } = req.body;

  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'الشركة غير موجودة' });
    }

    // Update basic fields
    if (companyName) company.companyName = companyName;
    if (responsiblePerson) company.responsiblePerson = responsiblePerson;
    if (phone) company.phone = phone;
    if (address) company.address = address;
    if (taxCardNumber) company.taxCardNumber = taxCardNumber;
    if (penaltyStatus) company.penaltyStatus = penaltyStatus;

    if (commercialRegister && commercialRegister !== company.commercialRegister) {
      const existing = await Company.findOne({ commercialRegister });
      if (existing) {
        return res.status(400).json({ success: false, message: 'رقم السجل التجاري مسجل بالفعل لشركة أخرى' });
      }
      company.commercialRegister = commercialRegister;
    }

    // If calibration date changed, recalculate renewal date
    if (lastCalibrationDate) {
      company.lastCalibrationDate = new Date(lastCalibrationDate);
      const renDate = new Date(company.lastCalibrationDate);
      renDate.setFullYear(renDate.getFullYear() + 1);
      company.nextRenewalDate = renDate;

      // Reset or adjust penalty status
      const now = new Date();
      if (renDate > now) {
        company.penaltyStatus = 'لا يوجد';
      } else if (company.penaltyStatus === 'لا يوجد') {
        company.penaltyStatus = 'متأخرة عن التجديد';
      }
    }

    await company.save();
    res.json({ success: true, message: 'تم تحديث بيانات الشركة بنجاح', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'الشركة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف الشركة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

module.exports = router;
