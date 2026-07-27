const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/auth');
const OfficeRegisterYear = require('../models/OfficeRegisterYear');
const PaperCompaniesRegister = require('../models/PaperCompaniesRegister');
const PaperGasStationsRegister = require('../models/PaperGasStationsRegister');
const PaperBasculRegister = require('../models/PaperBasculRegister');
const PaperRegister81 = require('../models/PaperRegister81');
const PaperIncomingRegister = require('../models/PaperIncomingRegister');
const PaperManufacturersRegister = require('../models/PaperManufacturersRegister');
const PaperWeighersRegister = require('../models/PaperWeighersRegister');

// Ensure upload directory exists for office records
const uploadDir = path.resolve(__dirname, '../../uploads/office_records');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'record-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to map category key to Mongoose Model
const getModelForCategory = (category) => {
  switch (category) {
    case 'companies':
      return PaperCompaniesRegister;
    case 'gas_stations':
      return PaperGasStationsRegister;
    case 'bascul_scales':
      return PaperBasculRegister;
    case 'register_81':
      return PaperRegister81;
    case 'incoming_register':
      return PaperIncomingRegister;
    case 'weights_manufacturers':
      return PaperManufacturersRegister;
    case 'weighers':
      return PaperWeighersRegister;
    default:
      return null;
  }
};

// Map category key to human-readable Arabic title
const categoryTitles = {
  companies: 'سجل الشركات',
  gas_stations: 'سجل محطات الوقود',
  bascul_scales: 'سجل موازين البسكول',
  register_81: 'سجل (81)',
  incoming_register: 'سجل الوارد',
  weights_manufacturers: 'سجل صناع الموازين',
  weighers: 'سجل الوزانين'
};

// Protect all routes with Admin Auth
router.use(protect);

// ==========================================
// 1. STATS ROUTE
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const categories = ['companies', 'gas_stations', 'bascul_scales', 'register_81', 'incoming_register', 'weights_manufacturers', 'weighers'];
    
    // Count total year entries configured
    const totalRegisters = await OfficeRegisterYear.countDocuments();

    // Calculate total records across all 7 collections
    let totalRecords = 0;
    let latestRecord = null;
    let latestTimestamp = 0;

    for (const cat of categories) {
      const Model = getModelForCategory(cat);
      if (Model) {
        const count = await Model.countDocuments();
        totalRecords += count;

        // Check for latest record
        const latest = await Model.findOne().sort({ createdAt: -1 });
        if (latest && latest.createdAt) {
          const time = new Date(latest.createdAt).getTime();
          if (time > latestTimestamp) {
            latestTimestamp = time;
            
            let displayName = '';
            if (cat === 'companies' || cat === 'bascul_scales') displayName = latest.companyName || latest.recordNumber;
            else if (cat === 'gas_stations') displayName = latest.stationName || latest.recordNumber;
            else if (cat === 'register_81') displayName = latest.applicantName || latest.serialNumber;
            else if (cat === 'incoming_register') displayName = latest.sender || latest.incomingNumber;
            else if (cat === 'weights_manufacturers' || cat === 'weighers') displayName = latest.name || latest.licenseNumber;

            latestRecord = {
              category: cat,
              categoryTitle: categoryTitles[cat],
              year: latest.year,
              displayName,
              date: latest.date || latest.createdAt,
              createdAt: latest.createdAt
            };
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalRegisters,
        totalRecords,
        latestRecord
      }
    });
  } catch (error) {
    console.error('Office records stats error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات السجلات الورقية' });
  }
});

// ==========================================
// 2. YEARS MANAGEMENT ROUTES
// ==========================================

// Get all years for a category (or all categories)
router.get('/years', async (req, res) => {
  const { category } = req.query;
  try {
    const query = category ? { category } : {};
    const yearsList = await OfficeRegisterYear.find(query).sort({ year: -1 });

    // Calculate dynamic record counts for each year
    const results = await Promise.all(yearsList.map(async (item) => {
      const Model = getModelForCategory(item.category);
      let count = 0;
      if (Model) {
        count = await Model.countDocuments({ year: item.year });
      }
      return {
        _id: item._id,
        category: item.category,
        year: item.year,
        notes: item.notes,
        recordsCount: count,
        createdAt: item.createdAt
      };
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Fetch years error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب السنوات المسجلة' });
  }
});

// Add a new year for a category
router.post('/years', async (req, res) => {
  const { category, year, notes } = req.body;
  
  if (!category || !year) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد السجل والسنة' });
  }

  if (!categoryTitles[category]) {
    return res.status(400).json({ success: false, message: 'نوع السجل غير صحيح' });
  }

  try {
    const existing = await OfficeRegisterYear.findOne({ category, year });
    if (existing) {
      return res.status(400).json({ success: false, message: `السنة ${year} مضافة بالفعل لهذا السجل` });
    }

    const newYear = new OfficeRegisterYear({
      category,
      year: Number(year),
      notes: notes || ''
    });

    await newYear.save();
    res.status(201).json({ success: true, data: newYear, message: `تم إضافة السنة ${year} بنجاح` });
  } catch (error) {
    console.error('Add year error:', error);
    res.status(500).json({ success: false, message: error.message || 'خطأ في إضافة السنة' });
  }
});

// Edit year notes
router.put('/years/:id', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const item = await OfficeRegisterYear.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'السنة غير موجودة' });
    }

    item.notes = notes !== undefined ? notes : item.notes;
    await item.save();

    res.json({ success: true, data: item, message: 'تم تحديث بيانات السنة بنجاح' });
  } catch (error) {
    console.error('Update year error:', error);
    res.status(500).json({ success: false, message: 'خطأ في تعديل بيانات السنة' });
  }
});

// Delete a year (and optionally delete associated records)
router.delete('/years/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await OfficeRegisterYear.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'السنة غير موجودة' });
    }

    const Model = getModelForCategory(item.category);
    if (Model) {
      // Clean up records under this year
      await Model.deleteMany({ year: item.year });
    }

    await OfficeRegisterYear.findByIdAndDelete(id);

    res.json({ success: true, message: `تم حذف السنة ${item.year} وجميع سجلاتها بنجاح` });
  } catch (error) {
    console.error('Delete year error:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف السنة' });
  }
});

// ==========================================
// 3. RECORDS CRUD ROUTES
// ==========================================

// Get records for category & year with search, sort, pagination
router.get('/records', async (req, res) => {
  const { category, year, search, sortBy = 'createdAt_desc', page = 1, limit = 10 } = req.query;

  if (!category || !year) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد السجل والسنة' });
  }

  const Model = getModelForCategory(category);
  if (!Model) {
    return res.status(400).json({ success: false, message: 'تصنيف السجل غير صحيح' });
  }

  try {
    const filter = { year: Number(year) };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      if (category === 'companies' || category === 'bascul_scales') {
        filter.$or = [
          { recordNumber: searchRegex },
          { companyName: searchRegex },
          { subject: searchRegex },
          { notes: searchRegex }
        ];
      } else if (category === 'gas_stations') {
        filter.$or = [
          { recordNumber: searchRegex },
          { stationName: searchRegex },
          { subject: searchRegex },
          { notes: searchRegex }
        ];
      } else if (category === 'register_81') {
        filter.$or = [
          { serialNumber: searchRegex },
          { applicantName: searchRegex },
          { requestType: searchRegex },
          { requestNumber: searchRegex },
          { notes: searchRegex }
        ];
      } else if (category === 'incoming_register') {
        filter.$or = [
          { incomingNumber: searchRegex },
          { sender: searchRegex },
          { subject: searchRegex },
          { notes: searchRegex }
        ];
      } else if (category === 'weights_manufacturers' || category === 'weighers') {
        filter.$or = [
          { name: searchRegex },
          { licenseNumber: searchRegex },
          { phone: searchRegex },
          { address: searchRegex },
          { notes: searchRegex }
        ];
      }
    }

    // Build Sort options
    let sortObj = { createdAt: -1 };
    if (sortBy === 'createdAt_asc') sortObj = { createdAt: 1 };
    else if (sortBy === 'date_desc') sortObj = { date: -1 };
    else if (sortBy === 'date_asc') sortObj = { date: 1 };
    else if (sortBy === 'number_desc') sortObj = { recordNumber: -1, serialNumber: -1, incomingNumber: -1, licenseNumber: -1 };
    else if (sortBy === 'number_asc') sortObj = { recordNumber: 1, serialNumber: 1, incomingNumber: 1, licenseNumber: 1 };
    else if (sortBy === 'name_asc') sortObj = { companyName: 1, stationName: 1, applicantName: 1, sender: 1, name: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Model.countDocuments(filter);
    const records = await Model.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات السجل' });
  }
});

// Create a new record
router.post('/records', upload.array('attachments', 5), async (req, res) => {
  const { category, year } = req.body;

  if (!category || !year) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد نوع السجل والسنة' });
  }

  const Model = getModelForCategory(category);
  if (!Model) {
    return res.status(400).json({ success: false, message: 'نوع السجل غير صحيح' });
  }

  try {
    // Process attached files
    const attachments = (req.files || []).map(file => ({
      fileName: file.filename,
      filePath: `/uploads/office_records/${file.filename}`,
      originalName: file.originalname
    }));

    let recordData = {
      year: Number(year),
      notes: req.body.notes || '',
      attachments
    };

    if (category === 'companies' || category === 'bascul_scales') {
      recordData.recordNumber = req.body.recordNumber;
      recordData.date = req.body.date;
      recordData.companyName = req.body.companyName;
      recordData.subject = req.body.subject;
    } else if (category === 'gas_stations') {
      recordData.recordNumber = req.body.recordNumber;
      recordData.date = req.body.date;
      recordData.stationName = req.body.stationName;
      recordData.subject = req.body.subject;
    } else if (category === 'register_81') {
      recordData.serialNumber = req.body.serialNumber;
      recordData.date = req.body.date;
      recordData.applicantName = req.body.applicantName;
      recordData.requestType = req.body.requestType;
      recordData.requestNumber = req.body.requestNumber || '';
    } else if (category === 'incoming_register') {
      recordData.incomingNumber = req.body.incomingNumber;
      recordData.date = req.body.date;
      recordData.sender = req.body.sender;
      recordData.subject = req.body.subject;
    } else if (category === 'weights_manufacturers' || category === 'weighers') {
      recordData.name = req.body.name;
      recordData.licenseNumber = req.body.licenseNumber;
      recordData.phone = req.body.phone || '';
      recordData.address = req.body.address || '';
      recordData.issueDate = req.body.issueDate || '';
      recordData.expiryDate = req.body.expiryDate || '';
    }

    const newRecord = new Model(recordData);
    await newRecord.save();

    // Ensure year exists in OfficeRegisterYear
    await OfficeRegisterYear.findOneAndUpdate(
      { category, year: Number(year) },
      { $setOnInsert: { category, year: Number(year) } },
      { upsert: true }
    );

    res.status(201).json({ success: true, data: newRecord, message: 'تم حفظ القيد في السجل بنجاح' });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ success: false, message: error.message || 'خطأ في حفظ القيد' });
  }
});

// Edit record
router.put('/records/:id', upload.array('attachments', 5), async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد نوع السجل' });
  }

  const Model = getModelForCategory(category);
  if (!Model) {
    return res.status(400).json({ success: false, message: 'نوع السجل غير صحيح' });
  }

  try {
    const record = await Model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'القيد غير موجود' });
    }

    // Process new files if uploaded
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        fileName: file.filename,
        filePath: `/uploads/office_records/${file.filename}`,
        originalName: file.originalname
      }));
      record.attachments = [...(record.attachments || []), ...newAttachments];
    }

    if (req.body.notes !== undefined) record.notes = req.body.notes;

    if (category === 'companies' || category === 'bascul_scales') {
      if (req.body.recordNumber) record.recordNumber = req.body.recordNumber;
      if (req.body.date) record.date = req.body.date;
      if (req.body.companyName) record.companyName = req.body.companyName;
      if (req.body.subject) record.subject = req.body.subject;
    } else if (category === 'gas_stations') {
      if (req.body.recordNumber) record.recordNumber = req.body.recordNumber;
      if (req.body.date) record.date = req.body.date;
      if (req.body.stationName) record.stationName = req.body.stationName;
      if (req.body.subject) record.subject = req.body.subject;
    } else if (category === 'register_81') {
      if (req.body.serialNumber) record.serialNumber = req.body.serialNumber;
      if (req.body.date) record.date = req.body.date;
      if (req.body.applicantName) record.applicantName = req.body.applicantName;
      if (req.body.requestType) record.requestType = req.body.requestType;
      if (req.body.requestNumber !== undefined) record.requestNumber = req.body.requestNumber;
    } else if (category === 'incoming_register') {
      if (req.body.incomingNumber) record.incomingNumber = req.body.incomingNumber;
      if (req.body.date) record.date = req.body.date;
      if (req.body.sender) record.sender = req.body.sender;
      if (req.body.subject) record.subject = req.body.subject;
    } else if (category === 'weights_manufacturers' || category === 'weighers') {
      if (req.body.name) record.name = req.body.name;
      if (req.body.licenseNumber) record.licenseNumber = req.body.licenseNumber;
      if (req.body.phone !== undefined) record.phone = req.body.phone;
      if (req.body.address !== undefined) record.address = req.body.address;
      if (req.body.issueDate !== undefined) record.issueDate = req.body.issueDate;
      if (req.body.expiryDate !== undefined) record.expiryDate = req.body.expiryDate;
    }

    await record.save();

    res.json({ success: true, data: record, message: 'تم تحديث بيانات القيد بنجاح' });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ success: false, message: 'خطأ في تعديل القيد' });
  }
});

// Delete record
router.delete('/records/:id', async (req, res) => {
  const { id } = req.params;
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ success: false, message: 'يرجى تحديد نوع السجل' });
  }

  const Model = getModelForCategory(category);
  if (!Model) {
    return res.status(400).json({ success: false, message: 'نوع السجل غير صحيح' });
  }

  try {
    const record = await Model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'القيد غير موجود' });
    }

    // Optionally delete uploaded attachment files from server
    if (record.attachments && record.attachments.length > 0) {
      record.attachments.forEach(att => {
        const fullPath = path.resolve(__dirname, '../..', att.filePath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) { console.error('Failed to unlink file:', e); }
        }
      });
    }

    await Model.findByIdAndDelete(id);

    res.json({ success: true, message: 'تم حذف القيد بنجاح' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف القيد' });
  }
});

module.exports = router;
