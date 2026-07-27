import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FolderArchive,
  Building2,
  Fuel,
  Scale,
  FileCheck,
  Inbox,
  Wrench,
  UserCheck,
  Plus,
  Search,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Eye,
  Paperclip,
  Download,
  X,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const categoryConfigs = {
  companies: {
    title: 'سجل الشركات',
    icon: Building2,
    color: 'from-blue-600 to-indigo-700',
    description: 'سجلات الشركات والمؤسسات المعتمدة الرسمية',
    nameLabel: 'اسم الشركة / الجهة',
    numLabel: 'رقم السجل',
    numField: 'recordNumber',
    nameField: 'companyName'
  },
  gas_stations: {
    title: 'سجل محطات الوقود',
    icon: Fuel,
    color: 'from-amber-600 to-orange-700',
    description: 'سجلات محطات تزويد الوقود ومضخات المعايرة',
    nameLabel: 'اسم محطة الوقود',
    numLabel: 'رقم السجل',
    numField: 'recordNumber',
    nameField: 'stationName'
  },
  bascul_scales: {
    title: 'سجل موازين البسكول',
    icon: Scale,
    color: 'from-emerald-600 to-teal-700',
    description: 'سجلات موازين البسكول الكبيرة والقبانات',
    nameLabel: 'اسم الشركة / الموقع',
    numLabel: 'رقم السجل',
    numField: 'recordNumber',
    nameField: 'companyName'
  },
  register_81: {
    title: 'سجل (81)',
    icon: FileCheck,
    color: 'from-purple-600 to-purple-800',
    description: 'السجل العام (81) الحاصر لجميع طلبات المعايرة الواردة',
    nameLabel: 'اسم مقدم الطلب',
    numLabel: 'الرقم المسلسل',
    numField: 'serialNumber',
    nameField: 'applicantName'
  },
  incoming_register: {
    title: 'سجل الوارد',
    icon: Inbox,
    color: 'from-sky-600 to-cyan-700',
    description: 'سجل المكاتبات والمخطوطات والمعاملات الواردة للمكتب',
    nameLabel: 'الجهة / الراسل',
    numLabel: 'رقم الوارد',
    numField: 'incomingNumber',
    nameField: 'sender'
  },
  weights_manufacturers: {
    title: 'سجل صناع الموازين',
    icon: Wrench,
    color: 'from-rose-600 to-pink-700',
    description: 'سجلات تراخيص وأصحاب ورش ومصنعي الموازين',
    nameLabel: 'اسم الصانع / المنشأة',
    numLabel: 'رقم الترخيص',
    numField: 'licenseNumber',
    nameField: 'name'
  },
  weighers: {
    title: 'سجل الوزانين',
    icon: UserCheck,
    color: 'from-teal-600 to-emerald-800',
    description: 'سجلات الوزانين المعتمدين وتراخيص ممارسة المهنة',
    nameLabel: 'اسم الوزان',
    numLabel: 'رقم الترخيص',
    numField: 'licenseNumber',
    nameField: 'name'
  }
};

export default function OfficeRecordsManager() {
  const token = localStorage.getItem('adminToken');

  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState(null); // e.g. 'companies'
  const [selectedYear, setSelectedYear] = useState(null); // e.g. 2026

  // Data States
  const [yearsList, setYearsList] = useState([]);
  const [recordsList, setRecordsList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [stats, setStats] = useState({ totalRegisters: 0, totalRecords: 0, latestRecord: null });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter / Search / Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  // Modals
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [yearForm, setYearForm] = useState({ year: new Date().getFullYear(), notes: '' });

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null); // { type: 'year'|'record', id, label }

  // Axios config helper
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch Summary Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/office-records/stats`, authHeaders);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  // Fetch Years for selected category
  const fetchYears = async (cat) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${API_BASE}/office-records/years?category=${cat}`, authHeaders);
      if (res.data.success) {
        setYearsList(res.data.data);
      }
    } catch (err) {
      setErrorMsg('فشل في تحميل قائمة السنوات للسجل');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Records for category & year
  const fetchRecords = async (cat, yr, page = 1, search = searchTerm, sort = sortBy) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(
        `${API_BASE}/office-records/records?category=${cat}&year=${yr}&page=${page}&search=${encodeURIComponent(search)}&sortBy=${sort}&limit=10`,
        authHeaders
      );
      if (res.data.success) {
        setRecordsList(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setErrorMsg('فشل في تحميل سجلات السنة المحددة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedCategory && !selectedYear) {
      fetchYears(selectedCategory);
    } else if (selectedCategory && selectedYear) {
      fetchRecords(selectedCategory, selectedYear, 1, searchTerm, sortBy);
    }
  }, [selectedCategory, selectedYear]);

  // Handle Search Input Change
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (selectedCategory && selectedYear) {
      fetchRecords(selectedCategory, selectedYear, 1, val, sortBy);
    }
  };

  // Handle Sort Change
  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    if (selectedCategory && selectedYear) {
      fetchRecords(selectedCategory, selectedYear, 1, searchTerm, val);
    }
  };

  // Create Year submit
  const handleCreateYear = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post(
        `${API_BASE}/office-records/years`,
        { category: selectedCategory, year: yearForm.year, notes: yearForm.notes },
        authHeaders
      );
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setIsYearModalOpen(false);
        setYearForm({ year: new Date().getFullYear(), notes: '' });
        fetchYears(selectedCategory);
        fetchStats();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'فشل إضافة السنة');
    }
  };

  // Prepare blank record form
  const openNewRecordModal = () => {
    setEditingRecord(null);
    setSelectedFiles([]);
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedCategory === 'companies' || selectedCategory === 'bascul_scales') {
      setRecordForm({ recordNumber: '', date: today, companyName: '', subject: '', notes: '' });
    } else if (selectedCategory === 'gas_stations') {
      setRecordForm({ recordNumber: '', date: today, stationName: '', subject: '', notes: '' });
    } else if (selectedCategory === 'register_81') {
      setRecordForm({ serialNumber: '', date: today, applicantName: '', requestType: 'معايرة واختبار', requestNumber: '', notes: '' });
    } else if (selectedCategory === 'incoming_register') {
      setRecordForm({ incomingNumber: '', date: today, sender: '', subject: '', notes: '' });
    } else if (selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') {
      setRecordForm({ name: '', licenseNumber: '', phone: '', address: '', issueDate: today, expiryDate: '', notes: '' });
    }
    setIsRecordModalOpen(true);
  };

  // Open Edit Record Modal
  const openEditRecordModal = (rec) => {
    setEditingRecord(rec);
    setSelectedFiles([]);
    setRecordForm({ ...rec });
    setIsRecordModalOpen(true);
  };

  // Save Record Submit (Add or Edit)
  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formData = new FormData();
    formData.append('category', selectedCategory);
    formData.append('year', selectedYear);

    Object.keys(recordForm).forEach(key => {
      if (key !== 'attachments' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        formData.append(key, recordForm[key] || '');
      }
    });

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('attachments', selectedFiles[i]);
    }

    try {
      let res;
      if (editingRecord) {
        res = await axios.put(`${API_BASE}/office-records/records/${editingRecord._id}`, formData, {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        res = await axios.post(`${API_BASE}/office-records/records`, formData, {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setIsRecordModalOpen(false);
        fetchRecords(selectedCategory, selectedYear, pagination.page, searchTerm, sortBy);
        fetchYears(selectedCategory);
        fetchStats();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'فشل حفظ بيانات القيد');
    }
  };

  // Delete Action Confirm
  const executeDelete = async () => {
    if (!deletingTarget) return;
    setErrorMsg('');
    try {
      if (deletingTarget.type === 'year') {
        const res = await axios.delete(`${API_BASE}/office-records/years/${deletingTarget.id}`, authHeaders);
        if (res.data.success) {
          setSuccessMsg(res.data.message);
          fetchYears(selectedCategory);
          fetchStats();
        }
      } else if (deletingTarget.type === 'record') {
        const res = await axios.delete(`${API_BASE}/office-records/records/${deletingTarget.id}?category=${selectedCategory}`, authHeaders);
        if (res.data.success) {
          setSuccessMsg(res.data.message);
          fetchRecords(selectedCategory, selectedYear, pagination.page, searchTerm, sortBy);
          fetchYears(selectedCategory);
          fetchStats();
        }
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء عملية الحذف');
    } finally {
      setDeletingTarget(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Export to Excel CSV (UTF-8 BOM formatted)
  const exportToExcel = () => {
    if (!recordsList || recordsList.length === 0) return;

    const conf = categoryConfigs[selectedCategory];
    let headers = [];

    if (selectedCategory === 'companies' || selectedCategory === 'bascul_scales' || selectedCategory === 'gas_stations') {
      headers = ['السنة', conf.numLabel, 'التاريخ', conf.nameLabel, 'الموضوع', 'الملاحظات'];
    } else if (selectedCategory === 'register_81') {
      headers = ['السنة', 'الرقم المسلسل', 'التاريخ', 'اسم مقدم الطلب', 'نوع الطلب', 'رقم الطلب', 'الملاحظات'];
    } else if (selectedCategory === 'incoming_register') {
      headers = ['السنة', 'رقم الوارد', 'التاريخ', 'الجهة / الراسل', 'الموضوع', 'الملاحظات'];
    } else if (selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') {
      headers = ['السنة', 'الاسم', 'رقم الترخيص', 'رقم الهاتف', 'العنوان', 'تاريخ الإصدار', 'تاريخ الانتهاء', 'الملاحظات'];
    }

    const rows = recordsList.map(item => {
      if (selectedCategory === 'companies' || selectedCategory === 'bascul_scales') {
        return [item.year, item.recordNumber, item.date, item.companyName, item.subject, item.notes];
      } else if (selectedCategory === 'gas_stations') {
        return [item.year, item.recordNumber, item.date, item.stationName, item.subject, item.notes];
      } else if (selectedCategory === 'register_81') {
        return [item.year, item.serialNumber, item.date, item.applicantName, item.requestType, item.requestNumber || '-', item.notes];
      } else if (selectedCategory === 'incoming_register') {
        return [item.year, item.incomingNumber, item.date, item.sender, item.subject, item.notes];
      } else if (selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') {
        return [item.year, item.name, item.licenseNumber, item.phone || '-', item.address || '-', item.issueDate || '-', item.expiryDate || '-', item.notes];
      }
      return [];
    });

    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      const escapedRow = row.map(val => `"${String(val || '').replace(/"/g, '""')}"`);
      csvContent += escapedRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${conf.title}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Print / PDF
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right font-cairo">
      
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-xs no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm font-semibold shadow-xs no-print">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <span
              className="cursor-pointer hover:text-gov-primary transition-all"
              onClick={() => { setSelectedCategory(null); setSelectedYear(null); }}
            >
              السجلات الورقية الداخلية
            </span>
            {selectedCategory && (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span
                  className="cursor-pointer hover:text-gov-primary transition-all"
                  onClick={() => setSelectedYear(null)}
                >
                  {categoryConfigs[selectedCategory]?.title}
                </span>
              </>
            )}
            {selectedYear && (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-gov-gold font-bold">سنة {selectedYear}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-gov-dark flex items-center gap-3">
            <FolderArchive className="w-7 h-7 text-gov-gold" />
            {selectedYear
              ? `${categoryConfigs[selectedCategory]?.title} - سنة ${selectedYear}`
              : selectedCategory
              ? categoryConfigs[selectedCategory]?.title
              : 'نظام إدارة السجلات الورقية والدفاتر الرسمية'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {selectedCategory
              ? categoryConfigs[selectedCategory]?.description
              : 'أرشيف رقمي داخلي لرقمنة وإدارة جميع السجلات الدفترية الرسمية لمكتب العبور'}
          </p>
        </div>

        {/* Global Action button */}
        {selectedCategory && !selectedYear && (
          <button
            onClick={() => setIsYearModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gov-primary hover:bg-gov-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-gov-gold" />
            <span>إضافة سنة جديدة للسجل</span>
          </button>
        )}

        {selectedYear && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF</span>
            </button>
            <button
              onClick={openNewRecordModal}
              className="flex items-center gap-2 px-4 py-2 bg-gov-primary hover:bg-gov-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-gov-gold" />
              <span>إضافة قيد جديد</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CATEGORY CARDS MAIN GRID */}
      {!selectedCategory && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block">إجمالي تخصصات السجلات</span>
                <span className="text-xl font-black text-gray-800 font-mono">7 دفاتر رسمية</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FolderArchive className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block">إجمالي السنوات الموثقة</span>
                <span className="text-xl font-black text-gray-800 font-mono">{stats.totalRegisters} سنة مسجلة</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block">إجمالي القيود المقيدة</span>
                <span className="text-xl font-black text-gray-800 font-mono">{stats.totalRecords} قيد مدون</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(categoryConfigs).map((key) => {
              const config = categoryConfigs[key];
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  onClick={() => { setSelectedCategory(key); setSelectedYear(null); }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs hover:shadow-lg hover:border-gov-primary/30 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l ${config.color}`}></div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${config.color} text-white shadow-md group-hover:scale-105 transition-all`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 group-hover:bg-gov-light group-hover:text-gov-primary transition-all">
                        سجل رقمي
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-gov-primary transition-all">
                        {config.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gov-primary group-hover:text-gov-dark">
                    <span>استعراض السنوات والقيود</span>
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: YEARS LIST FOR SELECTED CATEGORY */}
      {selectedCategory && !selectedYear && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gov-primary transition-all"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة لجميع السجلات</span>
            </button>
            <span className="text-xs font-semibold text-gray-500">
              اختر السنة لعرض القيود الدفترية المعايرة
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-white rounded-2xl border border-gray-150"></div>
              ))}
            </div>
          ) : yearsList.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center space-y-4">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-700">لا توجد سنوات مسجلة لهذا السجل بعد</h3>
                <p className="text-xs text-gray-400">انقر على "إضافة سنة جديدة للسجل" للبدء في تدوين السجلات الدفترية</p>
              </div>
              <button
                onClick={() => setIsYearModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gov-primary text-white rounded-xl text-xs font-bold hover:bg-gov-dark transition-all"
              >
                <Plus className="w-4 h-4 text-gov-gold" />
                <span>إضافة أول سنة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {yearsList.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs hover:shadow-md hover:border-gov-primary/30 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="p-3 rounded-xl bg-gov-light text-gov-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xl font-black text-gray-800 font-mono">سنة {item.year}</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">{item.recordsCount} قيد مسجل</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setDeletingTarget({ type: 'year', id: item._id, label: `سنة ${item.year}` })}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="حذف السنة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 truncate">
                      {item.notes}
                    </p>
                  )}

                  <button
                    onClick={() => setSelectedYear(item.year)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gov-light text-gov-primary hover:bg-gov-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <span>فتح الدفتر السنوي</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: RECORDS TABLE FOR SELECTED CATEGORY & YEAR */}
      {selectedCategory && selectedYear && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search & Filter & Navigation */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 no-print">
            <button
              onClick={() => setSelectedYear(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gov-primary transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>اختيار سنة أخرى</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-xl">
              {/* Search Box */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder={`البحث برقم السجل أو الاسم أو الموضوع...`}
                  className="w-full pr-10 pl-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gov-primary transition-all"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-semibold text-gray-700"
                >
                  <option value="createdAt_desc">الأحدث إضافة أولاً</option>
                  <option value="createdAt_asc">الأقدم إضافة أولاً</option>
                  <option value="date_desc">التاريخ الأحدث</option>
                  <option value="date_asc">التاريخ الأقدم</option>
                  <option value="number_asc">رقم القيد تصاعدي</option>
                  <option value="name_asc">الاسم أبجدياً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Printable Watermarked Header */}
          <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold">جمهورية مصر العربية - وزارة التموين والتجارة الداخلية</h2>
            <h3 className="text-lg font-bold">مصلحة دمغ المصوغات والموازين - مكتب العبور</h3>
            <h4 className="text-md font-bold mt-2">{categoryConfigs[selectedCategory]?.title} - لسنة {selectedYear}</h4>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 font-semibold animate-pulse">
                جاري تحميل قيود السجل الدفتري...
              </div>
            ) : recordsList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">لا توجد قيود مسجلة بهذا السجل لسنة {selectedYear}</p>
                <button
                  onClick={openNewRecordModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gov-primary text-white rounded-xl text-xs font-bold hover:bg-gov-dark transition-all"
                >
                  <Plus className="w-4 h-4 text-gov-gold" />
                  <span>تدوين أول قيد</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold">
                    <tr>
                      <th className="p-4">{categoryConfigs[selectedCategory]?.numLabel}</th>
                      <th className="p-4">التاريخ</th>
                      <th className="p-4">{categoryConfigs[selectedCategory]?.nameLabel}</th>
                      {(selectedCategory === 'companies' || selectedCategory === 'gas_stations' || selectedCategory === 'bascul_scales' || selectedCategory === 'incoming_register') && (
                        <th className="p-4">الموضوع</th>
                      )}
                      {selectedCategory === 'register_81' && (
                        <>
                          <th className="p-4">نوع الطلب</th>
                          <th className="p-4">رقم الطلب</th>
                        </>
                      )}
                      {(selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') && (
                        <>
                          <th className="p-4">الهاتف</th>
                          <th className="p-4">انتهاء الترخيص</th>
                        </>
                      )}
                      <th className="p-4">الملاحظات</th>
                      <th className="p-4">المرفقات</th>
                      <th className="p-4 text-center no-print">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {recordsList.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-all">
                        <td className="p-4 font-mono font-bold text-gov-primary">
                          {item.recordNumber || item.serialNumber || item.incomingNumber || item.licenseNumber}
                        </td>
                        <td className="p-4 font-mono text-gray-500">{item.date || item.issueDate}</td>
                        <td className="p-4 font-bold text-gray-900">
                          {item.companyName || item.stationName || item.applicantName || item.sender || item.name}
                        </td>
                        
                        {(selectedCategory === 'companies' || selectedCategory === 'gas_stations' || selectedCategory === 'bascul_scales' || selectedCategory === 'incoming_register') && (
                          <td className="p-4 max-w-xs truncate">{item.subject}</td>
                        )}

                        {selectedCategory === 'register_81' && (
                          <>
                            <td className="p-4"><span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-[11px] font-bold">{item.requestType}</span></td>
                            <td className="p-4 font-mono text-gray-500">{item.requestNumber || '-'}</td>
                          </>
                        )}

                        {(selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') && (
                          <>
                            <td className="p-4 font-mono dir-ltr text-right">{item.phone || '-'}</td>
                            <td className="p-4 font-mono text-amber-700">{item.expiryDate || '-'}</td>
                          </>
                        )}

                        <td className="p-4 max-w-xs truncate text-gray-400 font-normal">{item.notes || '-'}</td>

                        <td className="p-4">
                          {item.attachments && item.attachments.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={`http://localhost:5000${att.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gov-primary hover:text-white rounded-md text-[10px] font-bold text-gray-600 transition-all"
                                  title={att.originalName}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>مرفق {idx + 1}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[11px]">بدون مرفق</span>
                          )}
                        </td>

                        <td className="p-4 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingRecord(item)}
                              className="p-1.5 text-gray-500 hover:text-gov-primary hover:bg-gray-100 rounded-lg transition-all"
                              title="معاينة التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditRecordModal(item)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="تعديل القيد"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTarget({ type: 'record', id: item._id, label: `القيد رقم ${item.recordNumber || item.serialNumber || item.incomingNumber || item.licenseNumber}` })}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="حذف القيد"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs no-print">
                <span className="font-semibold text-gray-500">
                  عرض الصفحة {pagination.page} من إجمالي {pagination.pages} صفحة ({pagination.total} قيد)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => fetchRecords(selectedCategory, selectedYear, pagination.page - 1, searchTerm, sortBy)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-bold disabled:opacity-50 transition-all"
                  >
                    السابقة
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchRecords(selectedCategory, selectedYear, pagination.page + 1, searchTerm, sortBy)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-bold disabled:opacity-50 transition-all"
                  >
                    التالية
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL 1: ADD YEAR */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-base">إضافة سنة جديدة للسجل</h3>
              <button onClick={() => setIsYearModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">السنة</label>
                <input
                  type="number"
                  required
                  value={yearForm.year}
                  onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gov-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات السنة (اختياري)</label>
                <textarea
                  rows="3"
                  value={yearForm.notes}
                  onChange={(e) => setYearForm({ ...yearForm, notes: e.target.value })}
                  placeholder="أي ملاحظات حول هذا الدفتر السنوي..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gov-primary"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gov-primary text-white rounded-xl text-xs font-bold hover:bg-gov-dark transition-all"
                >
                  حفظ السنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT RECORD */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-gray-100 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-base">
                {editingRecord ? 'تعديل بيانات القيد الدفتري' : 'تدوين قيد دفتري جديد'}
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              
              {/* Dynamic form fields based on selectedCategory */}
              {(selectedCategory === 'companies' || selectedCategory === 'gas_stations' || selectedCategory === 'bascul_scales') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم السجل *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.recordNumber || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, recordNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ *</label>
                    <input
                      type="date"
                      required
                      value={recordForm.date || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {categoryConfigs[selectedCategory].nameLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={recordForm[categoryConfigs[selectedCategory].nameField] || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, [categoryConfigs[selectedCategory].nameField]: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">الموضوع *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.subject || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'register_81' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الرقم المسلسل *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.serialNumber || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, serialNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ *</label>
                    <input
                      type="date"
                      required
                      value={recordForm.date || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم مقدم الطلب *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.applicantName || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, applicantName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نوع الطلب *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.requestType || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, requestType: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الطلب (إن وجد)</label>
                    <input
                      type="text"
                      value={recordForm.requestNumber || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, requestNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'incoming_register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الوارد *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.incomingNumber || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, incomingNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ *</label>
                    <input
                      type="date"
                      required
                      value={recordForm.date || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">الجهة / الراسل *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.sender || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, sender: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">الموضوع *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.subject || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>
                </div>
              )}

              {(selectedCategory === 'weights_manufacturers' || selectedCategory === 'weighers') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.name || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الترخيص *</label>
                    <input
                      type="text"
                      required
                      value={recordForm.licenseNumber || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={recordForm.phone || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={recordForm.address || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ إصدار الترخيص</label>
                    <input
                      type="date"
                      value={recordForm.issueDate || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, issueDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ انتهاء الترخيص</label>
                    <input
                      type="date"
                      value={recordForm.expiryDate || ''}
                      onChange={(e) => setRecordForm({ ...recordForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الملاحظات</label>
                <textarea
                  rows="2"
                  value={recordForm.notes || ''}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="ملاحظات توثيقية إضافية..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gov-primary"
                ></textarea>
              </div>

              {/* Attachments Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">إرفاق وثائق جديدة (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gov-light file:text-gov-primary hover:file:bg-gov-primary hover:file:text-white transition-all cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gov-primary text-white rounded-xl text-xs font-bold hover:bg-gov-dark transition-all"
                >
                  حفظ القيد
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW RECORD DETAILS */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-base">تفاصيل القيد الدفتري</h3>
              <button onClick={() => setViewingRecord(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center font-mono">
                <span className="text-gray-400 font-bold">السنة / رقم القيد:</span>
                <span className="font-extrabold text-gov-primary">{viewingRecord.year} - {viewingRecord.recordNumber || viewingRecord.serialNumber || viewingRecord.incomingNumber || viewingRecord.licenseNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block mb-1">التاريخ:</span>
                  <span className="font-bold text-gray-800 font-mono">{viewingRecord.date || viewingRecord.issueDate}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block mb-1">الاسم / الجهة:</span>
                  <span className="font-bold text-gray-800">{viewingRecord.companyName || viewingRecord.stationName || viewingRecord.applicantName || viewingRecord.sender || viewingRecord.name}</span>
                </div>
              </div>

              {viewingRecord.subject && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block mb-1">الموضوع:</span>
                  <span className="font-semibold text-gray-800">{viewingRecord.subject}</span>
                </div>
              )}

              {viewingRecord.notes && (
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="text-gray-400 block mb-1">الملاحظات:</span>
                  <p className="text-gray-700 font-normal">{viewingRecord.notes}</p>
                </div>
              )}

              {viewingRecord.attachments && viewingRecord.attachments.length > 0 && (
                <div>
                  <span className="text-gray-500 font-bold block mb-1">الملفات المرفقة:</span>
                  <div className="space-y-1.5">
                    {viewingRecord.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={`http://localhost:5000${att.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 bg-gov-light text-gov-primary rounded-xl font-bold hover:bg-gov-primary hover:text-white transition-all"
                      >
                        <span className="truncate">{att.originalName}</span>
                        <Download className="w-4 h-4 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base">تأكيد عملية الحذف النهائية</h3>
              <p className="text-xs text-gray-500 mt-1">
                هل أنت تأكد من رغبتك في حذف <strong className="text-red-600">{deletingTarget.label}</strong>؟
                {deletingTarget.type === 'year' && ' سيؤدي ذلك لحذف جميع القيود التابعة لهذه السنة.'}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
              >
                تراجع
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
