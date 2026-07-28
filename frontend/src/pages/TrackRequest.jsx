import React, { useState } from 'react';
import axios from 'axios';
import {
  Search,
  Calendar,
  Clock,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  FileSearch,
  CreditCard,
  Building2,
  DollarSign,
  Award
} from 'lucide-react';

const API_BASE = 'https://scales-backend.onrender.com/api';
export default function TrackRequest() {
  const [requestNumber, setRequestNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSearchResult(null);

    if (!requestNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم الطلب للتتبع');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/requests/track`, {
        params: {
          requestNumber: requestNumber.trim()
        }
      });

      if (response.data.success) {
        setSearchResult(response.data.data);
      } else {
        setErrorMsg('لم يتم العثور على أي نتائج تطابق رقم الطلب المدخل');
      }
    } catch (err) {
      console.error('Tracking query error:', err);
      setErrorMsg(
        err.response?.data?.message ||
        'لم يتم العثور على طلب مطابق أو حدث خطأ في الاتصال بالخادم.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Determine timeline stage index (1 to 6)
  const getStatusStep = (status) => {
    switch (status) {
      case 'تم استلام الطلب': return 1;
      case 'تمت مراجعة الطلب': return 2;
      case 'مستندات ناقصة': return 2;
      case 'قيد المراجعة': return 2;
      case 'تحديد زيارة مكتب العبور لإتمام الدفع': return 3;
      case 'تم الدفع': return 4;
      case 'تحديد موعد الزيارة والدمغ والمعايرة': return 5;
      case 'تم تحديد موعد': return 5;
      case 'تم تنفيذ الدمغ والمعايرة': return 6;
      case 'مرفوض': return 0;
      default: return 1;
    }
  };

  const steps = [
    { num: 1, label: 'تم استلام الطلب' },
    { num: 2, label: 'تمت مراجعة الطلب' },
    { num: 3, label: 'زيارة مكتب الدفع' },
    { num: 4, label: 'تم الدفع' },
    { num: 5, label: 'موعد المعايرة' },
    { num: 6, label: 'تم تنفيذ الدمغ' }
  ];

  const currentStep = searchResult ? getStatusStep(searchResult.status) : 1;

  const getTypeLabel = (type) => {
    switch (type) {
      case 'company': return 'الشركات والمصانع والبساتيك';
      case 'fuel_station': return 'محطات الوقود';
      case 'fuel_tanker': return 'فناطيس نقل الوقود';
      default: return 'الشركات والمصانع والبساتيك';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right">

      {/* Title */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex p-3 bg-gov-light rounded-2xl text-gov-primary">
          <FileSearch className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gov-dark">الاستعلام عن حالة الطلب</h1>
        <p className="text-gray-500 max-w-xl mx-auto font-light text-sm sm:text-base">
          أدخل رقم الطلب الصادر عند التقديم لمتابعة مراحل سير العمل ومواعيد زيارة مكتب العبور والتفتيش الميداني.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-stretch">

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">رقم الطلب</label>
            <input
              type="text"
              placeholder="أدخل رقم الطلب"
              value={requestNumber}
              onChange={(e) => setRequestNumber(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 placeholder-gray-400 focus:outline-none font-mono text-base"
              required
            />
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto py-3.5 px-8 bg-gov-primary hover:bg-gov-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all focus:outline-none disabled:opacity-50 text-base"
            >
              <Search className="w-5 h-5 shrink-0" />
              <span>استعلم</span>
            </button>
          </div>

        </form>
      </div>

      {errorMsg && (
        <div className="p-4.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex gap-3 items-start animate-shake">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Results Display */}
      {searchResult && (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden animate-fade-in space-y-8 p-8">

          {/* Header & Result Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-3">
            <div>
              <h2 className="text-xl font-bold text-gov-dark">{searchResult.companyName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 font-mono">رقم الطلب: {searchResult.requestNumber}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-gov-light text-gov-primary rounded-md">
                  {getTypeLabel(searchResult.requestType)}
                </span>
              </div>
            </div>
            <div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${searchResult.status === 'تم تنفيذ الدمغ والمعايرة' ? 'bg-green-100 text-green-800' :
                  searchResult.status === 'تم الدفع' ? 'bg-teal-100 text-teal-800' :
                    searchResult.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || searchResult.status === 'تم تحديد موعد' ? 'bg-purple-100 text-purple-800' :
                      searchResult.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' ? 'bg-amber-100 text-amber-900' :
                        searchResult.status === 'تمت مراجعة الطلب' ? 'bg-blue-100 text-blue-800' :
                          searchResult.status === 'مستندات ناقصة' ? 'bg-orange-100 text-orange-800' :
                            searchResult.status === 'مرفوض' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-700'
                }`}>
                {searchResult.status}
              </span>
            </div>
          </div>

          {/* Timeline Visual - 6 Stages */}
          {searchResult.status !== 'مرفوض' && (
            <div className="py-6 overflow-x-auto">
              <div className="flex items-center justify-between relative min-w-[600px] max-w-2xl mx-auto select-none px-4">

                {/* Horizontal line */}
                <div className="absolute left-8 right-8 top-4.5 h-1 bg-gray-200 -z-10 rounded"></div>

                {/* Colored fill line */}
                {currentStep > 1 && (
                  <div
                    className="absolute left-8 right-8 top-4.5 h-1 bg-gov-secondary -z-10 rounded transition-all duration-500"
                    style={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                      marginRight: 'auto',
                      marginLeft: 0
                    }}
                  ></div>
                )}

                {steps.map((step) => {
                  const isCompleted = step.num < currentStep;
                  const isActive = step.num === currentStep;
                  return (
                    <div key={step.num} className="flex flex-col items-center gap-2.5 relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-4 transition-all duration-300 ${isCompleted ? 'bg-gov-secondary text-white border-gov-secondary shadow-md' :
                          isActive ? 'bg-white text-gov-gold border-gov-primary ring-4 ring-gov-light shadow-md scale-110' :
                            'bg-white text-gray-400 border-gray-200'
                        }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                      </div>
                      <span className={`text-[11px] font-bold text-center max-w-[80px] leading-tight ${isActive ? 'text-gov-primary font-extrabold' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* Stage Details Section */}
          <div className="space-y-6">

            {/* STAGE 3: Office Payment Visit Scheduled Card */}
            {(searchResult.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' || searchResult.paymentVisitDate) && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base border-b border-amber-200/60 pb-3">
                  <CreditCard className="w-6 h-6 text-amber-600 shrink-0" />
                  <h3>تم تحديد موعد لزيارة مكتب تفتيش موازين العبور لإتمام إجراءات الدفع.</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-semibold mb-1">تاريخ الزيارة:</span>
                    <span className="font-extrabold text-gov-dark font-mono text-base">{searchResult.paymentVisitDate || 'غير محدد'}</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-semibold mb-1">الوقت:</span>
                    <span className="font-extrabold text-gov-dark font-mono text-base">{searchResult.paymentVisitTime || 'غير محدد'}</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-semibold mb-1">رسوم الخدمة:</span>
                    <span className="font-extrabold text-amber-700 font-mono text-base">
                      {searchResult.paymentFee || '450'} جنيه مصري
                    </span>
                  </div>
                </div>

                {searchResult.adminNotes && searchResult.status === 'تحديد زيارة مكتب العبور لإتمام الدفع' && (
                  <div className="bg-white p-3.5 rounded-xl border border-amber-100 text-xs text-gray-700 space-y-1">
                    <span className="font-bold text-amber-900 block">ملاحظات:</span>
                    <p className="font-medium">{searchResult.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 4: Payment Confirmed Badge */}
            {(searchResult.paymentCompleted || searchResult.status === 'تم الدفع') && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-sm font-bold flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0" />
                <div>
                  <span>✔ تم الدفع وإتمام الإجراءات المالية بالمكتب بنجاح.</span>
                </div>
              </div>
            )}

            {/* STAGE 5: Field Calibration Visit Scheduled Card */}
            {(searchResult.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || searchResult.status === 'تم تحديد موعد' || searchResult.calibrationVisitDate) && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-purple-900 font-bold text-base border-b border-purple-200/60 pb-3">
                  <Calendar className="w-6 h-6 text-purple-600 shrink-0" />
                  <h3>تم تحديد موعد الزيارة والدمغ والمعايرة</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-purple-100 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-semibold mb-1">تاريخ الزيارة:</span>
                    <span className="font-extrabold text-gov-dark font-mono text-base">
                      {searchResult.calibrationVisitDate || searchResult.appointmentDate || 'غير محدد'}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-purple-100 flex flex-col justify-center">
                    <span className="text-xs text-gray-400 font-semibold mb-1">الوقت:</span>
                    <span className="font-extrabold text-gov-dark font-mono text-base">
                      {searchResult.calibrationVisitTime || searchResult.appointmentTime || 'غير محدد'}
                    </span>
                  </div>
                </div>

                {searchResult.adminNotes && (searchResult.status === 'تحديد موعد الزيارة والدمغ والمعايرة' || searchResult.status === 'تم تحديد موعد') && (
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs text-gray-700 space-y-1">
                    <span className="font-bold text-purple-900 block">ملاحظات:</span>
                    <p className="font-medium">{searchResult.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 6: Calibration Completed Badge */}
            {(searchResult.calibrationCompleted || searchResult.status === 'تم تنفيذ الدمغ والمعايرة') && (
              <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-green-900 text-sm font-bold flex items-center gap-3.5">
                <Award className="w-7 h-7 text-green-600 shrink-0" />
                <div>
                  <span className="text-base font-extrabold block">✔ تم تنفيذ الدمغ والمعايرة بنجاح</span>
                  <span className="text-xs text-green-700 font-normal mt-0.5 block">تمت المعايرة الفنية وحفظ تاريخ التجديد السنوي التلقائي.</span>
                </div>
              </div>
            )}

            {/* Warning Message for Missing Documents */}
            {searchResult.status === 'مستندات ناقصة' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex gap-3 text-sm text-orange-900 leading-normal">
                <ShieldAlert className="w-5 h-5 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <strong>ملاحظة إدارية:</strong> هناك مستندات مرفقة بالطلب تحتاج لمراجعة أو لم ترفع بشكل صحيح. يرجى تزويد المكتب بها يدويًا أو متابعة الإشعار.
                  {searchResult.adminNotes && <p className="mt-2 text-xs font-bold">تفاصيل: {searchResult.adminNotes}</p>}
                </div>
              </div>
            )}

            {/* General Request Info Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-gray-150 flex items-center justify-between">
                  <span className="text-gray-400 font-medium">رقم الطلب:</span>
                  <span className="font-bold text-gov-primary font-mono">{searchResult.requestNumber}</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-150 flex items-center justify-between">
                  <span className="text-gray-400 font-medium">نوع الطلب:</span>
                  <span className="font-bold text-gov-dark">{getTypeLabel(searchResult.requestType)}</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-150 flex items-center justify-between sm:col-span-2">
                  <span className="text-gray-400 font-medium">اسم الجهة / الشركة / المقاول:</span>
                  <span className="font-bold text-gov-dark">{searchResult.companyName}</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-150 flex items-center justify-between sm:col-span-2">
                  <span className="text-gray-400 font-medium">حالة الطلب الحالية:</span>
                  <span className="font-extrabold text-gov-dark">{searchResult.status}</span>
                </div>
              </div>

              {/* General Advice */}
              <div className="text-xs text-gray-400 border-t border-gray-200 pt-3 flex gap-2 justify-start leading-normal">
                <span>💡</span>
                <span>في حال وجود أي استفسارات فنية، يمكنكم الاتصال بالدعم الفني وتزويدهم برقم الطلب ({searchResult.requestNumber}).</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
