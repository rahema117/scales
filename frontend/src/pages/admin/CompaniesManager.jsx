import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building, Plus, Search, Edit2, Trash2, Calendar, ClipboardList, Phone, User, AlertTriangle, Loader2, ArrowLeft, History } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function CompaniesManager() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompanyHistory, setSelectedCompanyHistory] = useState(null);

  // Forms State
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    commercialRegister: '',
    taxCardNumber: '',
    responsiblePerson: '',
    lastCalibrationDate: '',
    penaltyStatus: 'لا يوجد'
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCompanies(response.data.data);
        setFilteredCompanies(response.data.data);
      } else {
        setErrorMsg('فشل تحميل قائمة الشركات');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالخادم لتحميل سجلات الشركات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(
        companies.filter(c => 
          c.companyName.includes(query) || 
          c.commercialRegister.includes(query)
        )
      );
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      phone: '',
      address: '',
      commercialRegister: '',
      taxCardNumber: '',
      responsiblePerson: '',
      lastCalibrationDate: '',
      penaltyStatus: 'لا يوجد'
    });
    setEditingCompany(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddForm(true);
    setSelectedCompanyHistory(null);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      companyName: comp.companyName,
      phone: comp.phone,
      address: comp.address,
      commercialRegister: comp.commercialRegister,
      taxCardNumber: comp.taxCardNumber,
      responsiblePerson: comp.responsiblePerson,
      lastCalibrationDate: comp.lastCalibrationDate ? comp.lastCalibrationDate.split('T')[0] : '',
      penaltyStatus: comp.penaltyStatus
    });
    setShowAddForm(true);
    setSelectedCompanyHistory(null);
  };

  const handleViewHistory = async (comp) => {
    setIsLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API_BASE}/companies/${comp._id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedCompanyHistory(response.data.data);
        setShowAddForm(false);
      } else {
        alert('فشل جلب سجل تاريخ الشركة');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في استعلام السجل التاريخي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشركة وسجلاتها من النظام؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.delete(`${API_BASE}/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        alert(response.data.message);
        fetchCompanies();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء محاولة الحذف');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    // Validations
    if (!formData.companyName || !formData.commercialRegister || !formData.phone || !formData.lastCalibrationDate) {
      alert('اسم الشركة، السجل التجاري، رقم الهاتف، وتاريخ المعايرة هي حقول إجبارية');
      return;
    }

    try {
      if (editingCompany) {
        // Edit API call
        const response = await axios.put(`${API_BASE}/companies/${editingCompany._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          alert('تم تحديث سجل الشركة بنجاح');
          setShowAddForm(false);
          resetForm();
          fetchCompanies();
        } else {
          alert(response.data.message);
        }
      } else {
        // Add manual legacy API call
        const response = await axios.post(`${API_BASE}/companies`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          alert('تم إضافة الشركة بنجاح واحتساب موعد التجديد القادم تلقائيًا');
          setShowAddForm(false);
          resetForm();
          fetchCompanies();
        } else {
          alert(response.data.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'فشلت العملية. يرجى مراجعة المدخلات.');
    }
  };

  return (
    <div className="space-y-6 text-right select-none">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-dark">سجلات الشركات والمؤسسات المعتمدة</h1>
          <p className="text-xs text-gray-500 mt-1">إضافة الشركات يدويًا من الدفاتر الورقية القديمة وتعديل بيانات المعايرة الدورية</p>
        </div>
        
        {!showAddForm && !selectedCompanyHistory && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gov-primary hover:bg-gov-dark text-white rounded-xl font-bold text-xs shadow-md transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سجل ورقي قديم</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LIST COLUMN - Col 7/12 (Always visible on left/right depending on RTL, let's keep it left side in RTL layout) */}
        <div className={`${showAddForm || selectedCompanyHistory ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6 transition-all`}>
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الشركة أو رقم السجل التجاري..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white text-xs font-semibold focus:outline-none"
            />
            <div className="absolute right-4 top-3.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
              <span className="text-xs text-gray-400">جاري البحث وتحميل ملفات الشركات...</span>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-light">
              لا توجد سجلات مطابقة للبحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
                    <th className="p-3">اسم الشركة</th>
                    <th className="p-3 text-center">السجل التجاري</th>
                    <th className="p-3 text-center">الهاتف</th>
                    <th className="p-3 text-center font-bold text-gray-600">التجديد القادم</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {filteredCompanies.map((comp) => (
                    <tr key={comp._id} className="hover:bg-gov-light/35 transition-colors">
                      <td className="p-3 font-semibold text-gov-dark">{comp.companyName}</td>
                      <td className="p-3 text-center font-mono text-gray-500">{comp.commercialRegister}</td>
                      <td className="p-3 text-center font-mono text-gray-400">{comp.phone}</td>
                      <td className="p-3 text-center font-mono text-gov-primary font-bold">
                        {new Date(comp.nextRenewalDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          comp.penaltyStatus === 'لا يوجد' ? 'bg-green-100 text-green-800' :
                          comp.penaltyStatus === 'متأخرة عن التجديد' ? 'bg-red-100 text-red-800' :
                          comp.penaltyStatus === 'تم تطبيق الغرامة' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.penaltyStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewHistory(comp)}
                            className="p-1.5 bg-gov-light text-gov-primary hover:bg-gov-primary hover:text-white rounded-lg transition-all"
                            title="عرض السجل التاريخي"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                            title="تعديل البيانات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comp._id)}
                            className="p-1.5 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white rounded-lg transition-all"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILS/FORM PANEL - Col 5/12 */}
        {(showAddForm || selectedCompanyHistory) && (
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-fade-in relative">
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedCompanyHistory(null);
                resetForm();
              }}
              className="absolute top-4 left-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* CASE 1: ADD/EDIT FORM */}
            {showAddForm && (
              <div className="space-y-5">
                <h3 className="font-bold text-base text-gov-primary border-r-4 border-gov-gold pr-2.5 leading-none">
                  {editingCompany ? 'تعديل بيانات الشركة' : 'إضافة سجل ورقي يدويًا'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-600">
                  <div className="flex flex-col gap-1.5">
                    <span>اسم الشركة بالكامل *</span>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="اسم المنشأة كما هو بالسجل"
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span>رقم الهاتف *</span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="رقم هاتف المنشأة"
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs font-mono"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span>رقم السجل التجاري *</span>
                      <input
                        type="text"
                        value={formData.commercialRegister}
                        onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                        placeholder="السجل التجاري (فريد)"
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs font-mono"
                        required
                        disabled={!!editingCompany} // keep commercialRegister immutable once saved to match DB rules
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span>البطاقة الضريبية</span>
                      <input
                        type="text"
                        value={formData.taxCardNumber}
                        onChange={(e) => setFormData({ ...formData, taxCardNumber: e.target.value })}
                        placeholder="اختياري"
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span>اسم المندوب المسؤول</span>
                      <input
                        type="text"
                        value={formData.responsiblePerson}
                        onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                        placeholder="اسم المندوب"
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span>العنوان</span>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="العنوان بمدينة العبور"
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span>تاريخ آخر معايرة *</span>
                      <input
                        type="date"
                        value={formData.lastCalibrationDate}
                        onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs font-mono"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span>حالة الغرامة المالية</span>
                      <select
                        value={formData.penaltyStatus}
                        onChange={(e) => setFormData({ ...formData, penaltyStatus: e.target.value })}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                      >
                        <option value="لا يوجد">لا يوجد</option>
                        <option value="متأخرة عن التجديد">متأخرة عن التجديد</option>
                        <option value="تم تطبيق الغرامة">تم تطبيق الغرامة</option>
                        <option value="تم سداد الغرامة">تم سداد الغرامة</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gov-goldLight/30 border border-gov-gold/30 rounded-xl p-3 flex gap-2 text-[10px] text-gov-dark items-start leading-normal">
                    <span>💡</span>
                    <span>عند إدخال تاريخ آخر معايرة، سيقوم النظام تلقائيًا بحساب تاريخ استحقاق التجديد للعام القادم (تاريخ المعايرة + سنة واحدة).</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gov-primary hover:bg-gov-dark text-white rounded-xl font-bold text-xs transition-all shadow-md mt-2"
                  >
                    {editingCompany ? 'حفظ التعديلات' : 'إدراج الشركة وحفظ السجل'}
                  </button>
                </form>
              </div>
            )}

            {/* CASE 2: COMPANY CALIBRATION HISTORY */}
            {selectedCompanyHistory && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-gov-primary border-r-4 border-gov-gold pr-2.5 leading-none">
                    السجل التاريخي للمعايرات
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1">{selectedCompanyHistory.company.companyName}</p>
                </div>

                {/* Company Details */}
                <div className="bg-gray-50 rounded-2xl p-4.5 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">السجل التجاري</span>
                    <span className="font-bold text-gray-700 font-mono">{selectedCompanyHistory.company.commercialRegister}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">آخر معايرة رسمية</span>
                    <span className="font-bold text-gray-700 font-mono">
                      {new Date(selectedCompanyHistory.company.lastCalibrationDate).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">موعد التجديد القادم</span>
                    <span className="font-bold text-gov-primary font-mono">
                      {new Date(selectedCompanyHistory.company.nextRenewalDate).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                {/* History List */}
                <div className="space-y-3">
                  <span className="font-bold text-xs text-gray-400">الطلبات والمعاينات الرقمية المسجلة:</span>
                  
                  {selectedCompanyHistory.history.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-light text-xs bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                      لا توجد طلبات إلكترونية مسجلة (تم إدراج الشركة يدويًا).
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {selectedCompanyHistory.history.map((h) => (
                        <div key={h._id} className="bg-white p-3 rounded-xl border border-gray-150 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-gov-primary font-mono block">{h.requestNumber}</span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(h.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-green-100 text-green-800 rounded-full">
                              {h.status}
                            </span>
                            <span className="block text-[9px] text-gray-400 mt-1">{h.scalesCount} ميزان</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
