const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

// Helper to update overdue status
const updateOverdueStatus = async () => {
  const now = new Date();
  await Company.updateMany(
    { nextRenewalDate: { $lt: now }, penaltyStatus: 'لا يوجد' },
    { $set: { penaltyStatus: 'متأخرة عن التجديد' } }
  );
};

// @desc    Get dashboard metrics & card counts
// @route   GET /api/reports/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, async (req, res) => {
  try {
    await updateOverdueStatus();
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Card 1: Total requests
    const totalRequests = await Request.countDocuments();

    // Card 2: Total companies
    const totalCompanies = await Company.countDocuments();

    // Card 3: New requests (status: 'تم استلام الطلب')
    const newRequests = await Request.countDocuments({ status: 'تم استلام الطلب' });

    // Card 4: Requests under review or in progress
    const reviewRequests = await Request.countDocuments({
      status: { $in: ['قيد المراجعة', 'تمت مراجعة الطلب', 'تحديد زيارة مكتب العبور لإتمام الدفع', 'تم الدفع', 'تحديد موعد الزيارة والدمغ والمعايرة', 'تم تحديد موعد'] }
    });

    // Card 5: Companies close to renewal (renewal in next 30 days)
    const upcomingRenewals = await Company.countDocuments({
      nextRenewalDate: { $gte: now, $lte: thirtyDaysFromNow }
    });

    // Card 6: Overdue companies (nextRenewalDate < now)
    const overdueCompanies = await Company.countDocuments({
      nextRenewalDate: { $lt: now }
    });

    // Card 7: Penalty companies (anything other than 'لا يوجد')
    const penaltyCompanies = await Company.countDocuments({
      penaltyStatus: { $ne: 'لا يوجد' }
    });

    // Office Records calculation
    const OfficeRegisterYear = require('../models/OfficeRegisterYear');
    const PaperCompaniesRegister = require('../models/PaperCompaniesRegister');
    const PaperGasStationsRegister = require('../models/PaperGasStationsRegister');
    const PaperBasculRegister = require('../models/PaperBasculRegister');
    const PaperRegister81 = require('../models/PaperRegister81');
    const PaperIncomingRegister = require('../models/PaperIncomingRegister');
    const PaperManufacturersRegister = require('../models/PaperManufacturersRegister');
    const PaperWeighersRegister = require('../models/PaperWeighersRegister');

    const totalRegisters = await OfficeRegisterYear.countDocuments();
    const officeModels = [
      { name: 'سجل الشركات', model: PaperCompaniesRegister, cat: 'companies' },
      { name: 'سجل محطات الوقود', model: PaperGasStationsRegister, cat: 'gas_stations' },
      { name: 'سجل موازين البسكول', model: PaperBasculRegister, cat: 'bascul_scales' },
      { name: 'سجل (81)', model: PaperRegister81, cat: 'register_81' },
      { name: 'سجل الوارد', model: PaperIncomingRegister, cat: 'incoming_register' },
      { name: 'سجل صناع الموازين', model: PaperManufacturersRegister, cat: 'weights_manufacturers' },
      { name: 'سجل الوزانين', model: PaperWeighersRegister, cat: 'weighers' }
    ];

    let totalPaperRecords = 0;
    let latestPaperRecord = null;
    let latestTimestamp = 0;

    for (const item of officeModels) {
      const count = await item.model.countDocuments();
      totalPaperRecords += count;

      const latest = await item.model.findOne().sort({ createdAt: -1 });
      if (latest && latest.createdAt) {
        const t = new Date(latest.createdAt).getTime();
        if (t > latestTimestamp) {
          latestTimestamp = t;
          let label = '';
          if (item.cat === 'companies' || item.cat === 'bascul_scales') label = latest.companyName || latest.recordNumber;
          else if (item.cat === 'gas_stations') label = latest.stationName || latest.recordNumber;
          else if (item.cat === 'register_81') label = latest.applicantName || latest.serialNumber;
          else if (item.cat === 'incoming_register') label = latest.sender || latest.incomingNumber;
          else if (item.cat === 'weights_manufacturers' || item.cat === 'weighers') label = latest.name || latest.licenseNumber;

          latestPaperRecord = {
            categoryName: item.name,
            year: latest.year,
            label,
            createdAt: latest.createdAt
          };
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalRequests,
        totalCompanies,
        newRequests,
        reviewRequests,
        upcomingRenewals,
        overdueCompanies,
        penaltyCompanies,
        paperRecords: {
          totalRegisters,
          totalRecords: totalPaperRecords,
          latestRecord: latestPaperRecord
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats query error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

// @desc    Get export lists for specific report types
// @route   GET /api/reports/export/:type
// @access  Private (Admin)
router.get('/export/:type', protect, async (req, res) => {
  const { type } = req.params;

  try {
    await updateOverdueStatus();
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    let list = [];

    switch (type) {
      case 'all-companies':
        list = await Company.find().sort({ companyName: 1 });
        break;
      
      case 'all-requests':
        list = await Request.find().sort({ createdAt: -1 });
        break;

      case 'upcoming-renewals':
        list = await Company.find({
          nextRenewalDate: { $gte: now, $lte: thirtyDaysFromNow }
        }).sort({ nextRenewalDate: 1 });
        break;

      case 'overdue-companies':
        list = await Company.find({
          nextRenewalDate: { $lt: now }
        }).sort({ nextRenewalDate: 1 });
        break;

      case 'penalty-companies':
        list = await Company.find({
          penaltyStatus: { $ne: 'لا يوجد' }
        }).sort({ nextRenewalDate: 1 });
        break;

      default:
        return res.status(400).json({ success: false, message: 'نوع التقرير غير صحيح' });
    }

    res.json({
      success: true,
      type,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('Report export query error:', error.message);
    res.status(500).json({ success: false, message: 'خطأ داخلي في الخادم' });
  }
});

module.exports = router;
