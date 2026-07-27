const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Request = require('../models/Request');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

// Setup multer storage
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDF, JPG, PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مسموح به. المسموح فقط: PDF, JPG, PNG'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Fields to upload
const uploadFields = upload.fields([
  { name: 'requestFile', maxCount: 1 },
  { name: 'authorizationFile', maxCount: 1 },
  { name: 'commercialRegisterFile', maxCount: 1 },
  { name: 'taxCardFile', maxCount: 1 },
  { name: 'calibrationCertificateFile', maxCount: 1 },
  { name: 'vehicleLicenseFile', maxCount: 1 },
  { name: 'trailerLicenseFile', maxCount: 1 }
]);

// Helper: Generate request number (REQ-YYYY-XXXX)
const generateRequestNumber = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear + 1, 0, 1);

  const count = await Request.countDocuments({
    createdAt: { $gte: startOfYear, $lt: endOfYear }
  });

  const nextCountStr = String(count + 1).padStart(4, '0');
  return `REQ-${currentYear}-${nextCountStr}`;
};

// @desc    Submit new request
// @route   POST /api/requests
// @access  Public
router.post('/', (req, res) => {
  uploadFields(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `خطأ في تحميل الملفات: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const {
        requestType = 'company',
        companyName,
        responsiblePerson,
        phone,
        email,
        address,
        commercialRegister,
        taxCardNumber,
        scalesCount,
        scalesTypes,
        notes
      } = req.body;

      if (!['company', 'fuel_station', 'fuel_tanker'].includes(requestType)) {
        return res.status(400).json({ success: false, message: 'نوع الطلب غير صحيح' });
      }

      const filesObj = {};

      if (requestType === 'company' || requestType === 'fuel_station') {
        if (!companyName || !responsiblePerson || !phone || !address) {
          return res.status(400).json({ success: false, message: 'يرجى استكمال الحقول المطلوبة' });
        }
        if (
          !req.files ||
          !req.files.requestFile ||
          !req.files.authorizationFile ||
          !req.files.commercialRegisterFile ||
          !req.files.taxCardFile
        ) {
          return res.status(400).json({ success: false, message: 'يجب تحميل جميع المستندات المطلوبة (طلب المعايرة، التفويض، السجل التجاري، البطاقة الضريبية)' });
        }
        filesObj.requestFile = req.files.requestFile[0].filename;
        filesObj.authorizationFile = req.files.authorizationFile[0].filename;
        filesObj.commercialRegisterFile = req.files.commercialRegisterFile[0].filename;
        filesObj.taxCardFile = req.files.taxCardFile[0].filename;
      } else if (requestType === 'fuel_tanker') {
        if (!companyName || !phone) {
          return res.status(400).json({ success: false, message: 'يرجى إدخال اسم الشركة/المقاول ورقم الهاتف' });
        }
        if (
          !req.files ||
          !req.files.requestFile ||
          !req.files.calibrationCertificateFile ||
          !req.files.vehicleLicenseFile ||
          !req.files.trailerLicenseFile
        ) {
          return res.status(400).json({ success: false, message: 'يجب تحميل جميع المستندات المطلوبة (طلب المعايرة، شهادة العيار، رخصة السيارة، رخصة المقطورة)' });
        }
        filesObj.requestFile = req.files.requestFile[0].filename;
        filesObj.calibrationCertificateFile = req.files.calibrationCertificateFile[0].filename;
        filesObj.vehicleLicenseFile = req.files.vehicleLicenseFile[0].filename;
        filesObj.trailerLicenseFile = req.files.trailerLicenseFile[0].filename;
      }

      // Generate unique number
      const requestNumber = await generateRequestNumber();

      // Create Request
      const newRequest = new Request({
        requestNumber,
        requestType,
        companyName,
        responsiblePerson: responsiblePerson || '',
        phone,
        email: email || '',
        address: address || '',
        commercialRegister: commercialRegister || '',
        taxCardNumber: taxCardNumber || '',
        scalesCount: scalesCount ? parseInt(scalesCount, 10) : undefined,
        scalesTypes: scalesTypes || '',
        notes: notes || '',
        files: filesObj
      });

      await newRequest.save();

      res.status(201).json({
        success: true,
        message: 'تم استلام طلبكم بنجاح. يرجى الاحتفاظ برقم الطلب للاستعلام لاحقاً.',
        requestNumber,
        data: newRequest
      });
    } catch (error) {
      console.error('Request submission error:', error);
      res.status(500).json({ success: false, message: error.message || 'خطأ داخلي في الخادم' });
    }
  });
});

// @desc    Track request
// @route   GET /api/requests/track
// @access  Public
// @desc    Track request
// @route   GET /api/requests/track
// @access  Public
router.get('/track', async (req, res) => {
  const { requestNumber } = req.query;

  try {
    if (!requestNumber || !requestNumber.trim()) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم الطلب' });
    }

    const request = await Request.findOne({ requestNumber: requestNumber.trim() });

    if (!request) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على طلب مطابق لرقم الطلب المدخل' });
    }

    res.json({
      success: true,
      data: {
        requestNumber: request.requestNumber,
        requestType: request.requestType,
        companyName: request.companyName,
        status: request.status,
        paymentVisitDate: request.paymentVisitDate,
        paymentVisitTime: request.paymentVisitTime,
        paymentFee: request.paymentFee,
        paymentCompleted: request.paymentCompleted,
        calibrationVisitDate: request.calibrationVisitDate || request.appointmentDate,
        calibrationVisitTime: request.calibrationVisitTime || request.appointmentTime,
        calibrationCompleted: request.calibrationCompleted || request.status === 'تم تنفيذ الدمغ والمعايرة',
        appointmentDate: request.appointmentDate,
        appointmentTime: request.appointmentTime,
        adminNotes: request.adminNotes
      }
    });
  } catch (error) {
    console.error('Tracking error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Get single request details
// @route   GET /api/requests/:id
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Update request status or schedule visits
// @route   PUT /api/requests/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const {
    status,
    adminNotes,
    paymentVisitDate,
    paymentVisitTime,
    paymentFee,
    paymentCompleted,
    calibrationVisitDate,
    calibrationVisitTime,
    calibrationCompleted,
    appointmentDate,
    appointmentTime
  } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;

    // Payment visit details
    if (paymentVisitDate !== undefined) request.paymentVisitDate = paymentVisitDate;
    if (paymentVisitTime !== undefined) request.paymentVisitTime = paymentVisitTime;
    if (paymentFee !== undefined) request.paymentFee = paymentFee;
    if (paymentCompleted !== undefined) request.paymentCompleted = paymentCompleted;

    // Field calibration visit details
    if (calibrationVisitDate !== undefined) {
      request.calibrationVisitDate = calibrationVisitDate;
      request.appointmentDate = calibrationVisitDate;
    }
    if (calibrationVisitTime !== undefined) {
      request.calibrationVisitTime = calibrationVisitTime;
      request.appointmentTime = calibrationVisitTime;
    }
    if (calibrationCompleted !== undefined) request.calibrationCompleted = calibrationCompleted;

    // Legacy appointment fields support
    if (appointmentDate) request.appointmentDate = appointmentDate;
    if (appointmentTime) request.appointmentTime = appointmentTime;

    await request.save();
    res.json({ success: true, message: 'تم تحديث بيانات الطلب بنجاح', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Complete calibration process (Update request and sync Company)
// @route   PUT /api/requests/:id/complete
// @access  Private (Admin)
router.put('/:id/complete', protect, async (req, res) => {
  const { calibrationDate, scalesCount, adminNotes } = req.body;

  try {
    if (!calibrationDate) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال تاريخ المعايرة' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    // Update Request
    request.status = 'تم تنفيذ الدمغ والمعايرة';
    request.calibrationCompleted = true;
    if (adminNotes) {
      request.adminNotes = adminNotes;
    }
    await request.save();

    // Calculate dates
    const lastCalibrationDate = new Date(calibrationDate);
    const nextRenewalDate = new Date(lastCalibrationDate);
    nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);

    // Sync to Companies Collection (Find or Create by Commercial Register if present)
    let company = null;
    if (request.commercialRegister && request.commercialRegister.trim()) {
      company = await Company.findOne({ commercialRegister: request.commercialRegister.trim() });

      if (company) {
        // Update existing
        company.companyName = request.companyName;
        if (request.responsiblePerson) company.responsiblePerson = request.responsiblePerson;
        if (request.phone) company.phone = request.phone;
        if (request.address) company.address = request.address;
        if (request.taxCardNumber) company.taxCardNumber = request.taxCardNumber;
        company.lastCalibrationDate = lastCalibrationDate;
        company.nextRenewalDate = nextRenewalDate;
        company.penaltyStatus = 'لا يوجد'; // reset penalty on calibration completion
        await company.save();
      } else {
        // Create new
        company = new Company({
          companyName: request.companyName,
          responsiblePerson: request.responsiblePerson || 'غير محدد',
          phone: request.phone,
          address: request.address || 'غير محدد',
          commercialRegister: request.commercialRegister.trim(),
          taxCardNumber: request.taxCardNumber || 'غير محدد',
          lastCalibrationDate,
          nextRenewalDate,
          penaltyStatus: 'لا يوجد'
        });
        await company.save();
      }
    }

    res.json({
      success: true,
      message: 'تم تسجيل إتمام المعايرة والدمغ بنجاح',
      data: {
        request,
        company
      }
    });
  } catch (error) {
    console.error('Complete calibration error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

module.exports = router;
