import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Building, FilePlus2, RefreshCw, AlertCircle, AlertTriangle, ShieldCheck, Hourglass, FolderArchive } from 'lucide-react';

const API_BASE = 'https://scales-backend.onrender.com/api';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalCompanies: 0,
    newRequests: 0,
    reviewRequests: 0,
    upcomingRenewals: 0,
    overdueCompanies: 0,
    penaltyCompanies: 0,
    paperRecords: {
      totalRegisters: 0,
      totalRecords: 0,
      latestRecord: null
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');

    try {
      const response = await axios.get(`${API_BASE}/reports/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setErrorMsg('فشل استيراد بيانات الإحصائيات');
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
      setErrorMsg('خطأ في الاتصال بالخادم لتحميل الإحصائيات الرسمية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardData = [
    { title: 'إجمالي طلبات المعايرة', value: stats.totalRequests, icon: FileText, color: 'bg-blue-500', text: 'طلب إلكتروني' },
    { title: 'الشركات المسجلة بالملفات', value: stats.totalCompanies, icon: Building, color: 'bg-emerald-600', text: 'سجل شركة' },
    {
      title: 'إجمالي السجلات الورقية',
      value: stats.paperRecords?.totalRecords || 0,
      icon: FolderArchive,
      color: 'bg-purple-600',
      text: `${stats.paperRecords?.totalRegisters || 0} دفتر / سنة`,
      subText: stats.paperRecords?.latestRecord
        ? `آخر قيد: ${stats.paperRecords.latestRecord.label} (${stats.paperRecords.latestRecord.categoryName})`
        : 'لا توجد قيود مضافة حديثاً'
    },
    { title: 'الطلبات الجديدة غير المعالجة', value: stats.newRequests, icon: FilePlus2, color: 'bg-amber-500', text: 'طلب جديد' },
    { title: 'الطلبات قيد الفحص والمراجعة', value: stats.reviewRequests, icon: Hourglass, color: 'bg-sky-500', text: 'طلب قيد الفحص' },
    { title: 'الشركات القريبة من التجديد (< 30 يوم)', value: stats.upcomingRenewals, icon: RefreshCw, color: 'bg-indigo-500', text: 'تجديد مستحق قريباً' },
    { title: 'الشركات المتأخرة عن المعايرة السنوية', value: stats.overdueCompanies, icon: AlertCircle, color: 'bg-red-500', text: 'شركة متأخرة' },
    { title: 'الشركات المستحقة للغرامات المالية', value: stats.penaltyCompanies, icon: AlertTriangle, color: 'bg-rose-700', text: 'شركة تحت الغرامة' }
  ];

  return (
    <div className="space-y-8 text-right">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-dark">نظرة عامة على النظام والإحصائيات</h1>
          <p className="text-xs text-gray-500 mt-1">مؤشرات الأداء الفني ومتابعة التجديدات لمدينة العبور</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all focus:outline-none"
        >
          <span>تحديث الأرقام</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Grid of stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-150"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardData.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs hover:shadow-md hover:border-gov-primary/10 transition-all flex justify-between items-center relative overflow-hidden"
              >
                {/* Visual Color Pill indicator */}
                <div className={`absolute top-0 right-0 w-2.5 h-full ${card.color}`}></div>
                
                <div className="space-y-1.5 pr-2.5">
                  <span className="text-xs font-medium text-gray-400 block">{card.title}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-800 font-mono">{card.value}</span>
                    <span className="text-[10px] font-semibold text-gray-400">{card.text}</span>
                  </div>
                  {card.subText && (
                    <span className="text-[10px] text-purple-700 font-bold block truncate max-w-[170px]">{card.subText}</span>
                  )}
                </div>

                <div className={`p-3.5 rounded-xl ${card.color} text-white shrink-0 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Advisories Info Box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-gov-primary border-r-4 border-gov-gold pr-2.5 leading-none">
          إرشادات إدارة التفتيش والمراقبة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 font-light leading-relaxed">
          <div className="flex gap-2 items-start bg-gov-light/30 border border-gov-primary/5 p-4 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-gov-primary shrink-0 mt-0.5" />
            <div>
              <strong>متابعة الطلبات المجدولة:</strong> يرجى التحقق من تبويب "إدارة الطلبات الإلكترونية" يومياً لتنسيق مواعيد زيارة مفتشي المعايرة وجدولة الزيارات بمواقع الشركات وتغيير حالتها عند الإتمام لإنشاء السجلات الرسمية تلقائياً.
            </div>
          </div>
          
          <div className="flex gap-2 items-start bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>معالجة فترات التأخير والغرامات:</strong> النظام يقوم أوتوماتيكياً بفحص وتغيير حالة الشركات المتجاوزة لتاريخ المعايرة السنوي. يمكنك متابعة الشركات المتأخرة والتحكم في إثبات الغرامة وسدادها من خلال شاشة "متابعة التجديدات والغرامات".
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
