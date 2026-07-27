import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Eye, 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  FileWarning, 
  CalendarPlus, 
  CheckSquare, 
  MessageSquare, 
  Scale, 
  Loader2, 
  Building, 
  Fuel, 
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const UPLOADS_BASE = 'http://localhost:5000/uploads';

export default function RequestsManager() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Action Forms State
  const [adminNotes, setAdminNotes] = useState('');
  const [paymentVisit, setPaymentVisit] = useState({ date: '', time: '', fee: '450' });
  const [calibrationVisit, setCalibrationVisit] = useState({ date: '', time: '' });
  const [completeForm, setCompleteForm] = useState({ calibrationDate: '' });

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API_BASE}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRequests(response.data.data);
        applyFilter(response.data.data, statusFilter, typeFilter);
      } else {
        setErrorMsg('فشل استيراد قائمة الطلبات');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالخادم لتحميل الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const applyFilter = (allData, statusF, typeF) => {
    let result = [...allData];
    if (statusF !== 'all') {
      result = result.filter(r => r.status === statusF);
    }
    if (typeF !== 'all') {
      result = result.filter(r => (r.requestType || 'company') === typeF);
    }
    setFilteredRequests(result);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    applyFilter(requests, filter, typeFilter);
  };

  const handleTypeFilterChange = (filter) => {
    setTypeFilter(filter);
    applyFilter(requests, statusFilter, filter);
  };

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setAdminNotes(req.adminNotes || '');
    setPaymentVisit({
      date: req.paymentVisitDate || '',
      time: req.paymentVisitTime || '',
      fee: req.paymentFee || '450'
    });
    setCalibrationVisit({
      date: req.calibrationVisitDate || req.appointmentDate || '',
      time: req.calibrationVisitTime || req.appointmentTime || ''
    });
    setCompleteForm({
      calibrationDate: new Date().toISOString().split('T')[0]
    });
  };

  // Generic Update Request status/fields
  const updateRequestData = async (payload, successAlert) => {
    setActionLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.put(
        `${API_BASE}/requests/${selectedRequest._id}`,
        { ...payload, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedRequest(response.data.data);
        await fetchRequests();
        if (successAlert) alert(successAlert);
      } else {
        alert(response.data.message || 'حدث خطأ في تحديث بيانات الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 2: Review / Missing Docs / Reject
  const handleStage2Update = async (newStatus) => {
    await updateRequestData({ status: newStatus }, `تم تحديث حالة الطلب إلى: ${newStatus}`);
  };

  // Stage 3: Schedule Payment Visit
  const handleSchedulePaymentVisit = async (e) => {
    e.preventDefault();
    if (!paymentVisit.date || !paymentVisit.time || !paymentVisit.fee) {
      alert('يرجى تعبئة تاريخ ووقت الزيارة ومبلغ الرسوم');
      return;
    }
    await updateRequestData({
      status: 'تحديد زيارة مكتب العبور لإتمام الدفع',
      paymentVisitDate: paymentVisit.date,
      paymentVisitTime: paymentVisit.time,
      paymentFee: paymentVisit.fee
    }, 'تم تحديد موعد زيارة الدفع بمكتب العبور بنجاح');
  };

  // Stage 4: Mark Payment Completed
  const handleMarkPaymentCompleted = async () => {
    await updateRequestData({
      status: 'تم الدفع',
      paymentCompleted: true
    }, 'تم تسجيل إتمام الدفع بنجاح والانتقال لمرحلة المعايرة');
  };

  // Stage 5: Schedule Field Calibration Visit
  const handleScheduleCalibrationVisit = async (e) => {
    e.preventDefault();
    if (!calibrationVisit.date || !calibrationVisit.time) {
      alert('يرجى اختيار التاريخ والوقت لزيارة المعايرة');
      return;
    }
    await updateRequestData({
      status: 'تحديد موعد الزيارة والدمغ والمعايرة',
      calibrationVisitDate: calibrationVisit.date,
      calibrationVisitTime: calibrationVisit.time,
      appointmentDate: calibrationVisit.date,
      appointmentTime: calibrationVisit.time
    }, 'تم تحديد موعد زيارة المعايرة والدمغ بنجاح');
  };

  // Stage 6: Complete Calibration & Sync Renewal
  const handleCompleteCalibration = async (e) => {
    e.preventDefault();
    if (!completeForm.calibrationDate) {
      alert('يرجى اختيار تاريخ إتمام المعايرة الفعلي');
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.put(`${API_BASE}/requests/${selectedRequest._id}/complete`, {
        calibrationDate: completeForm.calibrationDate,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedRequest(response.data.data.request);
        await fetchRequests();
        alert('تم تسجيل انتهاء المعايرة والدمغ وتحديث سجل الشركة لسنة كاملة تلقائيًا');
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ تفاصيل إتمام عملية الدمغ والمعايرة');
    } finally {
      setActionLoading(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'كل الحالات' },
    { value: 'تم استلام الطلب', label: 'تم الاستلام' },
    { value: 'تمت مراجعة الطلب', label: 'تمت المراجعة' },
    { value: 'مستندات ناقصة', label: 'مستندات ناقصة' },
    { value: 'تحديد زيارة مكتب العبور لإتمام الدفع', label: 'زيارة الدفع' },
    { value: 'تم الدفع', label: 'تم الدفع' },
    { value: 'تحديد موعد الزيارة والدمغ والمعايرة', label: 'زيارة المعايرة' },
    { value: 'تم تنفيذ الدمغ والمعايرة', label: 'تم التنفيذ' },
    { value: 'مرفوض', label: 'مرفوض' }
  ];

  const typeOptions = [
    { value: 'all', label: 'جميع أنواع الطلبات' },
    { value: 'company', label: 'الشركات والمصانع' },
    { value: 'fuel_station', label: 'محطات الوقود' },
    { value: 'fuel_tanker', label: 'فناطيس نقل الوقود' }
  ];

  const getRequestTypeDetails = (type) => {
    switch (type) {
      case 'company':
        return { label: 'الشركات والمصانع والبساتيك', icon: Building, color: 'bg-blue-100 text-blue-800' };
      case 'fuel_station':
        return { label: 'محطات الوقود', icon: Fuel, color: 'bg-amber-100 text-amber-800' };
      case 'fuel_tanker':
        return { label: 'فناطيس نقل الوقود', icon: Truck, color: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: 'الشركات والمصانع والبساتيك', icon: Building, color: 'bg-blue-100 text-blue-800' };
    }
  };

  const fileLabels = {
    requestFile: 'طلب الدمغ والمعايرة',
    authorizationFile: 'طلب التفويض',
    commercialRegisterFile: 'السجل التجاري',
    taxCardFile: 'البطاقة الضريبية',
    calibrationCertificateFile: 'صورة شهادة العيار',
    vehicleLicenseFile: 'رخصة السيارة',
    trailerLicenseFile: 'رخصة المقطورة'
  };

  return (
    <div className="space-y-6 text-right select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gov-dark">متابعة وإدارة سير الطلبات الرسمية</h1>
        <p className="text-xs text-gray-500 mt-1">تتبع الخطوات الحكومية الست لـ "مكتب تفتيش موازين العبور" حسب الترتيب الإداري المعتمد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* REQUESTS LIST - Col 7 */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          
          {/* Filters Bar */}
          <div className="space-y-3 border-b border-gray-100 pb-4">
            
            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-400 ml-2">الحالة:</span>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusFilterChange(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                    statusFilter === opt.value
                      ? 'bg-gov-primary text-gov-gold shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-gray-400 ml-2">النوع:</span>
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTypeFilterChange(opt.value)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all focus:outline-none ${
                    typeFilter === opt.value
                      ? 'bg-gov-gold text-gov-dark shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Table Container */}
          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
              <span className="text-xs text-gray-400">جاري تحميل الطلبات...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-light">
              لا توجد طلبات تطابق الفلترة الحالية.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
                    <th className="p-3 text-right">رقم الطلب</th>
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-right">الجهة / الشركة</th>
                    <th className="p-3 text-center">تاريخ التقديم</th>
                    <th className="p-3 text-center">المرحلة الحالية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredRequests.map((req) => {
                    const reqTypeMeta = getRequestTypeDetails(req.requestType || 'company');
                    return (
                      <tr
                        key={req._id}
                        onClick={() => handleSelectRequest(req)}
                        className={`hover:bg-gov-light/35 cursor-pointer transition-colors ${
                          selectedRequest?._id === req._id ? 'bg-gov-light/60 border-r-4 border-gov-gold' : ''
                        }`}
                      >
                        <td className="p-3 font-semibold font-mono text-gov-primary">{req.requestNumber}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reqTypeMeta.color}`}>
                            {reqTypeMeta.label}
                          </span>
                        </td>
                        <td className="p-3 max-w-[150px] truncate font-bold text-gov-dark">{req.companyName}</td>
                        <td className="p-3 text-center font-mono text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'تم تنفيذ الدمغ والمعايرة' ? 'bg-green-100 text-green-800' :
                            req.status === 'تم الدفع' ? 'bg-teal-100 text-teal-800' :
                            req.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || req.status === 'تم تحديد موعد' ? 'bg-purple-100 text-purple-800' :
                            req.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' ? 'bg-amber-100 text-amber-900' :
                            req.status === 'تمت مراجعة الطلب' ? 'bg-blue-100 text-blue-800' :
                            req.status === 'مستندات ناقصة' ? 'bg-orange-100 text-orange-800' :
                            req.status === 'مرفوض' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILS PANEL - Col 5 */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
          {selectedRequest ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Title */}
              <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gov-dark">{selectedRequest.companyName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 font-mono">الطلب: {selectedRequest.requestNumber}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md font-mono">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                  {(() => {
                    const typeMeta = getRequestTypeDetails(selectedRequest.requestType || 'company');
                    return (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Info Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">المرحلة الحالية</span>
                  <span className="font-extrabold text-gov-primary">{selectedRequest.status}</span>
                </div>

                {selectedRequest.responsiblePerson && (
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">اسم المسؤول</span>
                    <span className="font-bold text-gray-700">{selectedRequest.responsiblePerson}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-400">رقم الهاتف</span>
                  <span className="font-bold text-gray-700 font-mono">{selectedRequest.phone}</span>
                </div>

                {selectedRequest.address && (
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                    <span className="text-gray-400">العنوان</span>
                    <span className="font-bold text-gray-700">{selectedRequest.address}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-400">ملاحظات تقديم الطلب</span>
                  <span className="font-bold text-gray-600 text-right max-w-[200px]">{selectedRequest.notes || 'لا يوجد'}</span>
                </div>
              </div>

              {/* Uploaded Files Section */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                <h4 className="font-bold text-xs text-gov-primary flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gov-gold" />
                  <span>المستندات المرفقة للطلب</span>
                </h4>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {selectedRequest.files && Object.keys(selectedRequest.files).map((key) => {
                    const filename = selectedRequest.files[key];
                    if (!filename) return null;
                    const label = fileLabels[key] || key;

                    return (
                      <div key={key} className="bg-white p-2.5 rounded-lg border border-gray-150 flex items-center justify-between">
                        <span className="font-semibold text-gray-700 text-[11px] truncate max-w-[170px]" title={label}>
                          {label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`${UPLOADS_BASE}/${filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-gov-light text-gov-primary hover:bg-gov-primary hover:text-white rounded-md transition-colors"
                            title="عرض في المتصفح"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`${UPLOADS_BASE}/${filename}`}
                            download
                            className="p-1 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                            title="تحميل الملف"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sequential Government Workflow Action Panel */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                
                <h4 className="font-extrabold text-xs text-gov-dark flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gov-gold" />
                  <span>إجراءات مراحل سير الطلب الحكومي</span>
                </h4>

                {/* Notes Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gov-gold" />
                    <span>ملاحظات الإدارة:</span>
                  </label>
                  <textarea
                    rows="2"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="اكتب أي ملاحظات أو إرشادات للمواطن..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* STAGE 1 / STAGE 2: Review & Document Approval */}
                {(selectedRequest.status === 'تم استلام الطلب' || selectedRequest.status === 'قيد المراجعة' || selectedRequest.status === 'مستندات ناقصة') && (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <span className="text-xs font-bold text-blue-900 block">المرحلة 2: مراجعة الطلب والمستندات</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStage2Update('تمت مراجعة الطلب')}
                        disabled={actionLoading}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد ومراجعة المستندات</span>
                      </button>
                      <button
                        onClick={() => handleStage2Update('مستندات ناقصة')}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                      >
                        <FileWarning className="w-4 h-4" />
                        <span>مستندات ناقصة</span>
                      </button>
                      <button
                        onClick={() => handleStage2Update('مرفوض')}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-900 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Schedule Office Payment Visit */}
                {(selectedRequest.status === 'تمت مراجعة الطلب' || selectedRequest.status === 'تحديد زيارة مكتب العبور لإتمام الدفع') && (
                  <form onSubmit={handleSchedulePaymentVisit} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <span>المرحلة 3: تحديد زيارة مكتب العبور لإتمام الدفع</span>
                      </span>
                      {selectedRequest.paymentVisitDate && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">مجدول</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold">تاريخ الزيارة</span>
                        <input
                          type="date"
                          value={paymentVisit.date}
                          onChange={(e) => setPaymentVisit({ ...paymentVisit, date: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold">الوقت</span>
                        <input
                          type="text"
                          placeholder="مثال: 10:00 AM"
                          value={paymentVisit.time}
                          onChange={(e) => setPaymentVisit({ ...paymentVisit, time: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold">رسوم الخدمة (ج.م)</span>
                        <input
                          type="text"
                          placeholder="450"
                          value={paymentVisit.fee}
                          onChange={(e) => setPaymentVisit({ ...paymentVisit, fee: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>{selectedRequest.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' ? 'تحديث موعد زيارة الدفع' : 'تثبيت موعد زيارة الدفع بالمكتب'}</span>
                    </button>
                  </form>
                )}

                {/* STAGE 4: Mark Payment Completed */}
                {(selectedRequest.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' || selectedRequest.status === 'تم الدفع') && (
                  <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        <span>المرحلة 4: استلام الرسوم والدفع</span>
                      </span>
                      {selectedRequest.paymentCompleted && (
                        <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-bold">✔ تم الدفع</span>
                      )}
                    </div>

                    {!selectedRequest.paymentCompleted && (
                      <button
                        onClick={handleMarkPaymentCompleted}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد استلام الرسوم الرسمية (تم الدفع)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* STAGE 5: Schedule Field Calibration Visit */}
                {(selectedRequest.status === 'تم الدفع' || selectedRequest.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || selectedRequest.status === 'تم تحديد موعد') && (
                  <form onSubmit={handleScheduleCalibrationVisit} className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>المرحلة 5: تحديد موعد الزيارة والدمغ والمعايرة الميدانية</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold">تاريخ المعايرة</span>
                        <input
                          type="date"
                          value={calibrationVisit.date}
                          onChange={(e) => setCalibrationVisit({ ...calibrationVisit, date: e.target.value })}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 font-semibold">الوقت</span>
                        <input
                          type="text"
                          placeholder="مثال: 09:30 AM"
                          value={calibrationVisit.time}
                          onChange={(e) => setCalibrationVisit({ ...calibrationVisit, time: e.target.value })}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>تثبيت موعد زيارة الدمغ والمعايرة</span>
                    </button>
                  </form>
                )}

                {/* STAGE 6: Mark Calibration Completed */}
                {(selectedRequest.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || selectedRequest.status === 'تم تحديد موعد' || selectedRequest.status === 'تم تنفيذ الدمغ والمعايرة') && (
                  <form onSubmit={handleCompleteCalibration} className="bg-green-50/60 border border-green-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-green-600" />
                        <span>المرحلة 6: إتمام وتنفيذ المعايرة والدمغ</span>
                      </span>
                    </div>

                    {selectedRequest.status !== 'تم تنفيذ الدمغ والمعايرة' ? (
                      <>
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-[10px] text-gray-500 font-semibold">تاريخ التنفيذ الفعلي</span>
                          <input
                            type="date"
                            value={completeForm.calibrationDate}
                            onChange={(e) => setCompleteForm({ ...completeForm, calibrationDate: e.target.value })}
                            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none text-xs"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-bold text-xs transition-all flex justify-center items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>تسجيل إتمام المعايرة والدمغ وتحديث التجديد</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-green-200 text-green-900 text-xs font-semibold flex gap-2 items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <span>تم إتمام الدمغ والمعايرة بنجاح وتحديث تاريخ التجديد التلقائي.</span>
                      </div>
                    )}
                  </form>
                )}

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 font-light text-center gap-3">
              <Scale className="w-12 h-12 text-gray-300 animate-pulse" />
              <span>اختر طلباً من القائمة بالجانب لعرض التفاصيل وإدارة خطة السير الإدارية.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
