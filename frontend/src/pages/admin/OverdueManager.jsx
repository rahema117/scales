import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, PhoneCall, CheckCircle2, RefreshCw, Hourglass, Loader2, Landmark } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function OverdueManager() {
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [activeTab, setActiveTab] = useState('overdue'); // 'overdue' or 'expiring'
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      // Fetch upcoming renewals
      const upcomingRes = await axios.get(`${API_BASE}/reports/export/upcoming-renewals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Fetch overdue companies
      const overdueRes = await axios.get(`${API_BASE}/reports/export/overdue-companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (upcomingRes.data.success && overdueRes.data.success) {
        setExpiringSoon(upcomingRes.data.data);
        setOverdue(overdueRes.data.data);
      } else {
        setErrorMsg('فشل استدعاء كشوفات التجديد والغرامات');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالخادم لمزامنة كشوفات التجديد');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Penalty Status for a specific company
  const handleUpdatePenalty = async (companyId, newStatus) => {
    setActionLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.put(`${API_BASE}/companies/${companyId}`, {
        penaltyStatus: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('تم تحديث حالة الغرامة للشركة بنجاح');
        await fetchData();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تعديل وضع الغرامة للشركة');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to calculate days late
  const getDaysLate = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = now - target;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6 text-right select-none">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gov-dark">متابعة التجديدات والغرامات السنوية</h1>
          <p className="text-xs text-gray-500 mt-1">رصد صلاحيات شهادات الدمغ للشركات وإدارة العقوبات المالية للمتأخرين</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all focus:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-gray-200 no-print">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all focus:outline-none ${
            activeTab === 'overdue'
              ? 'border-red-600 text-red-700 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          الشركات المتأخرة عن التجديد ({overdue.length})
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all focus:outline-none ${
            activeTab === 'expiring'
              ? 'border-gov-primary text-gov-primary font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          شركات يقترب انتهاء صلاحيتها ({expiringSoon.length})
        </button>
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="flex flex-col items-center py-16 gap-2 bg-white rounded-3xl border border-gray-100 shadow-2xs">
          <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
          <span className="text-xs text-gray-400">جاري مسح السجلات واستخراج الفوات المستحقة...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          
          {/* TAB 1: OVERDUE COMPANIES */}
          {activeTab === 'overdue' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-900 leading-normal">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong>رصد التأخير والغرامات:</strong> الكشوفات أدناه توضح الشركات التي تجاوزت موعد سريان المعايرة السنوي. يتعين الاتصال بهم للمطالبة بالتقدم بطلب دمغ جديد وتثبيت غرامة التأخير أو تحصيلها عند التسوية.
                </div>
              </div>

              {overdue.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-light text-sm">
                  لا توجد حاليًا أي شركات متأخرة عن موعد التجديد السنوي.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
                        <th className="p-3">اسم الشركة</th>
                        <th className="p-3 text-center">تاريخ انتهاء السريان</th>
                        <th className="p-3 text-center">أيام التأخير</th>
                        <th className="p-3 text-center">حالة الغرامة</th>
                        <th className="p-3 text-center">إجراءات الغرامة</th>
                        <th className="p-3 text-center">الاتصال</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {overdue.map((comp) => (
                        <tr key={comp._id} className="hover:bg-red-50/20 transition-colors">
                          <td className="p-3 font-semibold text-gray-800">{comp.companyName}</td>
                          <td className="p-3 text-center font-mono text-gray-500">
                            {new Date(comp.nextRenewalDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="p-3 text-center font-mono font-extrabold text-red-600">
                            {getDaysLate(comp.nextRenewalDate)} يوم تأخير
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              comp.penaltyStatus === 'تم تطبيق الغرامة' ? 'bg-red-100 text-red-800' :
                              comp.penaltyStatus === 'تم سداد الغرامة' ? 'bg-green-100 text-green-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {comp.penaltyStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleUpdatePenalty(comp._id, 'تم تطبيق الغرامة')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-all focus:outline-none"
                              >
                                تطبيق الغرامة
                              </button>
                              <button
                                onClick={() => handleUpdatePenalty(comp._id, 'تم سداد الغرامة')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 bg-green-700 hover:bg-green-800 text-white rounded text-[10px] font-bold transition-all focus:outline-none flex items-center gap-0.5"
                              >
                                <Landmark className="w-3 h-3" />
                                <span>إثبات سداد</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <a
                              href={`tel:${comp.phone}`}
                              className="inline-flex items-center gap-1.5 text-gov-primary hover:text-gov-dark font-bold hover:underline"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-gov-gold shrink-0" />
                              <span className="font-mono">{comp.phone}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPIRING SOON COMPANIES */}
          {activeTab === 'expiring' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-gov-light/30 border border-gov-primary/10 rounded-xl text-xs text-gov-primary leading-normal">
                <Hourglass className="w-5 h-5 text-gov-gold shrink-0 mt-0.5" />
                <div>
                  <strong>الشركات القريبة من التجديد:</strong> يعرض النظام هنا كشوفات المنشآت التي يقل الرصيد الزمني لصلاحية موازينها عن 30 يوماً. نوصي بالتواصل معهم هاتفياً للمبادرة بالتسجيل لعدم فرض غرامة انتهاء الصلاحية.
                </div>
              </div>

              {expiringSoon.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-light text-sm">
                  لا توجد حاليًا شركات تقع صلاحيتها خلال الـ 30 يومًا القادمة.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
                        <th className="p-3">اسم الشركة</th>
                        <th className="p-3 text-center">تاريخ انتهاء السريان</th>
                        <th className="p-3 text-center">الأيام المتبقية</th>
                        <th className="p-3 text-center">الهاتف للتواصل المباشر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                      {expiringSoon.map((comp) => (
                        <tr key={comp._id} className="hover:bg-gov-light/20 transition-colors">
                          <td className="p-3 font-semibold text-gray-800">{comp.companyName}</td>
                          <td className="p-3 text-center font-mono text-gray-500">
                            {new Date(comp.nextRenewalDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="p-3 text-center font-mono font-extrabold text-gov-primary">
                            {getDaysRemaining(comp.nextRenewalDate)} يوم متبقي
                          </td>
                          <td className="p-3 text-center">
                            <a
                              href={`tel:${comp.phone}`}
                              className="inline-flex items-center gap-1.5 text-gov-primary hover:text-gov-dark font-bold hover:underline"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-gov-gold shrink-0" />
                              <span className="font-mono">{comp.phone}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
