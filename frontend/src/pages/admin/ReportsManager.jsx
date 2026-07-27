import React, { useState } from 'react';
import axios from 'axios';
import { FileSpreadsheet, Printer, RefreshCw, FileText, Loader2, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ReportsManager() {
  const [reportType, setReportType] = useState('all-companies');
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReportData = async (type = reportType) => {
    setIsLoading(true);
    setErrorMsg('');
    setReportData([]);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await axios.get(`${API_BASE}/reports/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setErrorMsg('فشل سحب بيانات التقرير المطلوب');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالخادم لتحميل تقارير الإحصاء');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportChange = (e) => {
    const type = e.target.value;
    setReportType(type);
    fetchReportData(type);
  };

  // Export to Excel (Arabic-safe CSV with UTF-8 BOM)
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      alert('لا توجد بيانات متاحة للتصدير');
      return;
    }

    let csvContent = '';
    
    if (reportType === 'all-requests') {
      // Columns for Requests
      const headers = ['رقم الطلب', 'اسم الشركة', 'اسم المسؤول', 'رقم الهاتف', 'عدد الموازين', 'أنواع الموازين', 'تاريخ التقديم', 'الحالة'];
      csvContent += headers.join(',') + '\n';

      reportData.forEach((item) => {
        const row = [
          `"${item.requestNumber}"`,
          `"${item.companyName.replace(/"/g, '""')}"`,
          `"${item.responsiblePerson.replace(/"/g, '""')}"`,
          `"${item.phone}"`,
          `"${item.scalesCount}"`,
          `"${item.scalesTypes.replace(/"/g, '""')}"`,
          `"${new Date(item.createdAt).toLocaleDateString('ar-EG')}"`,
          `"${item.status}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      // Columns for Companies
      const headers = ['اسم الشركة', 'اسم المسؤول', 'رقم الهاتف', 'العنوان', 'رقم السجل التجاري', 'رقم البطاقة الضريبية', 'تاريخ آخر معايرة', 'تاريخ التجديد القادم', 'حالة الغرامة'];
      csvContent += headers.join(',') + '\n';

      reportData.forEach((item) => {
        const row = [
          `"${item.companyName.replace(/"/g, '""')}"`,
          `"${item.responsiblePerson.replace(/"/g, '""')}"`,
          `"${item.phone}"`,
          `"${item.address.replace(/"/g, '""')}"`,
          `"${item.commercialRegister}"`,
          `"${item.taxCardNumber}"`,
          `"${new Date(item.lastCalibrationDate).toLocaleDateString('ar-EG')}"`,
          `"${new Date(item.nextRenewalDate).toLocaleDateString('ar-EG')}"`,
          `"${item.penaltyStatus}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    }

    // Include Byte Order Mark (BOM) \uFEFF to tell Excel this is UTF-8 encoded, ensuring Arabic characters display correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // File Name based on type and timestamp
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `report-${reportType}-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (reportData.length === 0) {
      alert('لا توجد بيانات متاحة للطباعة');
      return;
    }
    window.print();
  };

  const getReportName = (type) => {
    switch (type) {
      case 'all-companies': return 'سجل كافة الشركات والمؤسسات المعتمدة';
      case 'all-requests': return 'سجل كافة طلبات المعايرة والدمغ الإلكترونية';
      case 'upcoming-renewals': return 'كشف الشركات التي أوشكت صلاحية معايرتها على الانتهاء (< 30 يوم)';
      case 'overdue-companies': return 'كشف الشركات المتأخرة والمقصرة عن التجديد السنوي';
      case 'penalty-companies': return 'كشف الشركات المستحقة أو المطبق عليها غرامة التأخير المالي';
      default: return 'تقرير غير محدد';
    }
  };

  return (
    <div className="space-y-6 text-right select-none">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gov-dark">مركز التقارير وتصدير البيانات</h1>
          <p className="text-xs text-gray-500 mt-1">توليد كشوفات إحصائية وطباعتها كملفات PDF رسمية أو تصديرها لجداول إكسيل</p>
        </div>
      </div>

      {/* Official print layout header (Only visible when printing) */}
      <div className="print-only print-header">
        <div className="text-right text-[10px] space-y-1">
          <div>الجمهورية العربية المصرية</div>
          <div>وزارة التموين والتجارة الداخلية</div>
          <div>مصلحة الدمغ والموازين - مكتب العبور</div>
        </div>
        <div className="text-center font-bold text-base border-2 border-black px-4 py-2 bg-gray-50 rounded">
          تقرير رسمي: {getReportName(reportType)}
        </div>
        <div className="text-left text-[9px] text-gray-500">
          <div>تاريخ التوليد: {new Date().toLocaleDateString('ar-EG')}</div>
          <div>بواسطة: بوابة الخدمات الإلكترونية</div>
        </div>
      </div>

      {/* Setup controls - hidden in print */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 no-print">
        
        <div className="w-full sm:w-auto flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400">حدد نوع التقرير المطلوب</label>
          <select
            value={reportType}
            onChange={handleReportChange}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 focus:outline-none focus:bg-white"
          >
            <option value="all-companies">سجل كافة الشركات المعتمدة</option>
            <option value="all-requests">سجل كافة طلبات المعايرة</option>
            <option value="upcoming-renewals">التجديدات المستحقة قريباً (&lt; 30 يوم)</option>
            <option value="overdue-companies">الشركات المتأخرة عن التجديد</option>
            <option value="penalty-companies">الشركات الخاضعة للغرامات</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex flex-wrap gap-3.5 pt-4 sm:pt-0">
          <button
            onClick={() => fetchReportData()}
            disabled={isLoading}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 focus:outline-none"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={isLoading || reportData.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold shadow-md transition-all focus:outline-none disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            <span>تصدير Excel</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isLoading || reportData.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gov-dark hover:bg-gov-primary text-white rounded-xl text-xs font-bold shadow-md transition-all focus:outline-none disabled:opacity-50"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>طباعة تقرير PDF</span>
          </button>
        </div>

      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm no-print">
          {errorMsg}
        </div>
      )}

      {/* Reports Table Display */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 printable-area">
        
        {isLoading ? (
          <div className="flex flex-col items-center py-16 gap-2 no-print">
            <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
            <span className="text-xs text-gray-400">جاري استيراد وتصفية البيانات...</span>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-light text-sm flex flex-col items-center gap-3 no-print">
            <Info className="w-10 h-10 text-gray-300" />
            <span>يرجى اختيار التقرير المطلوب أو الضغط على زر التحديث لتحميل الكشف لأول مرة.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === 'all-requests' ? (
              // REQUESTS TABLE
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-600">
                    <th className="p-3">رقم الطلب</th>
                    <th className="p-3">اسم الشركة</th>
                    <th className="p-3 text-center">المسؤول</th>
                    <th className="p-3 text-center">الهاتف</th>
                    <th className="p-3 text-center">الموازين</th>
                    <th className="p-3 text-center">تقديم الطلب</th>
                    <th className="p-3 text-center">حالة الطلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {reportData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold font-mono text-gov-primary">{item.requestNumber}</td>
                      <td className="p-3 font-bold text-gray-800">{item.companyName}</td>
                      <td className="p-3 text-center">{item.responsiblePerson}</td>
                      <td className="p-3 text-center font-mono text-gray-500">{item.phone}</td>
                      <td className="p-3 text-center font-mono">{item.scalesCount} ميزان</td>
                      <td className="p-3 text-center font-mono text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-[11px] text-gov-dark">{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // COMPANIES TABLE
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-600">
                    <th className="p-3">اسم الشركة</th>
                    <th className="p-3 text-center">السجل التجاري</th>
                    <th className="p-3 text-center">الهاتف</th>
                    <th className="p-3 text-center">المسؤول</th>
                    <th className="p-3 text-center">آخر معايرة</th>
                    <th className="p-3 text-center">التجديد القادم</th>
                    <th className="p-3 text-center">حالة الغرامة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {reportData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-800">{item.companyName}</td>
                      <td className="p-3 text-center font-mono text-gray-500">{item.commercialRegister}</td>
                      <td className="p-3 text-center font-mono text-gray-400">{item.phone}</td>
                      <td className="p-3 text-center">{item.responsiblePerson}</td>
                      <td className="p-3 text-center font-mono text-gray-400">
                        {new Date(item.lastCalibrationDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 text-center font-mono text-gov-primary font-bold">
                        {new Date(item.nextRenewalDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-[11px] text-gov-dark">{item.penaltyStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
