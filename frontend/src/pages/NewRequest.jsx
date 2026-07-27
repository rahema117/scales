import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Fuel, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  ClipboardList, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function NewRequest() {
  // Current step: 'select' | 'form'
  const [selectedType, setSelectedType] = useState(null); // 'company' | 'fuel_station' | 'fuel_tanker'

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    responsiblePerson: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Files State
  const [files, setFiles] = useState({});

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null); // stores { requestNumber, message }

  const handleSelectType = (type) => {
    setSelectedType(type);
    setErrorMsg('');
    setFormData({
      companyName: '',
      responsiblePerson: '',
      phone: '',
      address: '',
      notes: '',
    });
    setFiles({});
  };

  const handleResetSelection = () => {
    setSelectedType(null);
    setErrorMsg('');
    setSuccessData(null);
    setFiles({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
        setErrorMsg('نوع الملف غير مدعوم. المسموح به فقط: PDF, JPG, PNG');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت للملف الواحد.');
        return;
      }
      setErrorMsg('');
      setFiles((prev) => ({ ...prev, [fileKey]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Dynamic validations per request type
    if (selectedType === 'company') {
      if (
        !formData.companyName ||
        !formData.responsiblePerson ||
        !formData.phone ||
        !formData.address
      ) {
        setErrorMsg('يرجى ملء جميع الحقول المطلوبة المميزة بنجمة (*)');
        setIsLoading(false);
        return;
      }

      if (
        !files.requestFile ||
        !files.authorizationFile ||
        !files.commercialRegisterFile ||
        !files.taxCardFile
      ) {
        setErrorMsg('يرجى تحميل كافة المستندات الأربعة المطلوبة (طلب الدمغ والمعايرة، طلب التفويض، السجل التجاري، البطاقة الضريبية)');
        setIsLoading(false);
        return;
      }
    } else if (selectedType === 'fuel_station') {
      if (
        !formData.companyName ||
        !formData.responsiblePerson ||
        !formData.phone ||
        !formData.address
      ) {
        setErrorMsg('يرجى ملء جميع الحقول المطلوبة المميزة بنجمة (*)');
        setIsLoading(false);
        return;
      }

      if (
        !files.requestFile ||
        !files.authorizationFile ||
        !files.commercialRegisterFile ||
        !files.taxCardFile
      ) {
        setErrorMsg('يرجى تحميل كافة المستندات الأربعة المطلوبة (طلب الدمغ والمعايرة، طلب التفويض، السجل التجاري، البطاقة الضريبية)');
        setIsLoading(false);
        return;
      }
    } else if (selectedType === 'fuel_tanker') {
      if (!formData.companyName || !formData.phone) {
        setErrorMsg('يرجى ملء جميع الحقول المطلوبة (اسم الشركة أو المقاول ورقم الهاتف)');
        setIsLoading(false);
        return;
      }

      if (
        !files.requestFile ||
        !files.calibrationCertificateFile ||
        !files.vehicleLicenseFile ||
        !files.trailerLicenseFile
      ) {
        setErrorMsg('يرجى تحميل كافة المستندات الأربعة المطلوبة (طلب الدمغ والمعايرة، صورة شهادة العيار، رخصة السيارة، رخصة المقطورة)');
        setIsLoading(false);
        return;
      }
    }

    // Prepare Multipart Form Data
    const data = new FormData();
    data.append('requestType', selectedType);
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(`${API_BASE}/requests`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessData({
          requestNumber: response.data.requestNumber,
          message: response.data.message,
          type: selectedType
        });
      } else {
        setErrorMsg(response.data.message || 'فشل تقديم الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'خطأ في الاتصال بالخادم. يرجى التأكد من تشغيل خادم النظام والمحاولة لاحقاً.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // SUCCESS SCREEN
  if (successData) {
    const typeLabel = 
      successData.type === 'company' ? 'الشركات والمصانع والبساتيك' :
      successData.type === 'fuel_station' ? 'محطات الوقود' : 'فناطيس نقل الوقود';

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-right">
        <div className="bg-white rounded-3xl shadow-xl border border-gov-primary/10 overflow-hidden printable-area">
          {/* Header Bar */}
          <div className="bg-gov-dark text-white p-6 text-center border-b-4 border-gov-gold">
            <h2 className="text-xl font-bold">بوابة مصلحة الدمغ والموازين الإلكترونية</h2>
            <p className="text-xs text-gov-gold mt-1">إيصال استلام طلب معايرة رقمي - {typeLabel}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-gov-secondary animate-bounce" />
              <h3 className="text-2xl font-bold text-gov-dark">تم تقديم الطلب بنجاح</h3>
              <p className="text-sm text-gray-500 max-w-md">
                {successData.message}
              </p>
            </div>

            {/* Ticket Details */}
            <div className="bg-gov-light/40 border border-gov-primary/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gov-primary/10 pb-3">
                <span className="text-sm text-gray-500">رقم الطلب الفريد</span>
                <span className="text-xl font-extrabold text-gov-primary font-mono tracking-wider">
                  {successData.requestNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2.5">
                <span className="text-gray-500">نوع الطلب</span>
                <span className="font-bold text-gov-primary">{typeLabel}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2.5">
                <span className="text-gray-500">الجهة / اسم الشركة</span>
                <span className="font-bold text-gov-dark">{formData.companyName}</span>
              </div>
              {formData.responsiblePerson && (
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2.5">
                  <span className="text-gray-500">اسم المسؤول</span>
                  <span className="font-bold text-gov-dark">{formData.responsiblePerson}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2.5">
                <span className="text-gray-500">رقم الهاتف</span>
                <span className="font-bold text-gov-dark font-mono">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">حالة الطلب الافتراضية</span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  تم استلام الطلب
                </span>
              </div>
            </div>

            {/* Note & Actions */}
            <div className="bg-gov-goldLight/30 border border-gov-gold/30 rounded-xl p-4 flex gap-3 text-sm text-gov-dark items-start leading-relaxed">
              <Info className="w-5 h-5 text-gov-gold shrink-0 mt-0.5" />
              <div>
                <strong>تنبيه هام:</strong> يرجى الاحتفاظ برقم الطلب (<strong>{successData.requestNumber}</strong>) للتمكن من الاستعلام عن حالة الطلب ومتابعة إجراءات الفحص والزيارة.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-6 bg-gov-dark hover:bg-gov-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-transparent shadow transition-all focus:outline-none"
              >
                <Printer className="w-5 h-5" />
                <span>طباعة إيصال الاستلام</span>
              </button>
              <Link
                to="/"
                className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 1. SELECTION PAGE (اختر نوع الطلب)
  if (!selectedType) {
    const requestTypes = [
      {
        id: 'company',
        title: 'الشركات والمصانع والبساكيل',
        desc: 'تقديم طلب معايرة ودمغ للمنشآت والمصانع والشركات التجارية وموازين البسكول',
        icon: Building,
        color: 'from-blue-600 to-gov-primary',
        badge: 'طلب شركات ومصانع'
      },
      {
        id: 'fuel_station',
        title: 'محطات الوقود',
        desc: 'تقديم طلب معايرة وتحقق ودمغ  مضخات الوقود لمحطات التزويد بالوقود',
        icon: Fuel,
        color: 'from-amber-600 to-gov-gold',
        badge: 'طلب محطة وقود'
      },
      {
        id: 'fuel_tanker',
        title: 'فناطيس نقل الوقود',
        desc: 'تقديم طلب معايرة لفناطيس وصهاريج نقل الوقود والمشتقات البترولية',
        icon: Truck,
        color: 'from-emerald-600 to-teal-700',
        badge: 'طلب صهريج / فنطاس'
      }
    ];

    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-right animate-fade-in">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex p-3.5 bg-gov-light rounded-2xl text-gov-primary shadow-sm">
            <ClipboardList className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-dark">اختر نوع الطلب</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-light text-sm sm:text-base leading-relaxed">
            يرجى تحديد تصنيف المنشأة أو نوع الخدمة المطلوبة للانتقال إلى نموذج تقديم المستندات المخصص.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {requestTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectType(item.id)}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Top Gradient Line */}
                <div className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-r ${item.color}`} />
                
                <div className="space-y-6">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="p-4 rounded-2xl bg-gov-light text-gov-primary group-hover:bg-gov-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full group-hover:bg-gov-goldLight group-hover:text-gov-dark transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-gov-dark group-hover:text-gov-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-8 mt-6 border-t border-gray-100 flex items-center justify-between text-gov-primary font-bold text-sm">
                  <span>متابعة تقديم الطلب</span>
                  <div className="w-8 h-8 rounded-full bg-gov-light flex items-center justify-center group-hover:bg-gov-primary group-hover:text-white transition-all transform group-hover:-translate-x-1">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gov-primary font-semibold transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>

      </div>
    );
  }

  // 2. FORM COMPONENTS & RENDER logic
  const renderInput = (label, name, icon, type = 'text', required = true, placeholder = '') => {
    const Icon = icon;
    return (
      <div className="flex flex-col gap-2 text-right">
        <label className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none"
            placeholder={placeholder || label}
            required={required}
          />
          <div className="absolute right-4 top-3.5 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  const renderFileUpload = (label, fileKey) => {
    const file = files[fileKey];
    return (
      <div className="flex flex-col gap-2 text-right bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
        <label className="text-sm font-bold text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        
        <div className="relative border-2 border-dashed border-gray-200 hover:border-gov-primary/40 rounded-xl transition-all p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] bg-gray-50">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, fileKey)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-gov-secondary" />
              <span className="text-xs font-semibold text-gov-dark max-w-[200px] truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-[10px] text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} ميجابايت
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-600">اختر الملف أو اسحبه هنا</span>
              <span className="text-[10px] text-gray-400">صيغ: PDF, JPG, PNG (أقصى 5MB)</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getFormTitle = () => {
    switch (selectedType) {
      case 'company':
        return {
          title: 'طلب معايرة للشركات والمصانع والبساتيك',
          desc: 'يرجى تعبئة بيانات المنشأة ومندوب الطلب ورفع المستندات الرسمية الأربعة المطلوبة.',
          icon: Building
        };
      case 'fuel_station':
        return {
          title: 'طلب معايرة ومراجعة محطات الوقود',
          desc: 'يرجى تعبئة بيانات المحطة والمسؤول ورفع المستندات المعتمدة لإعادة المعايرة.',
          icon: Fuel
        };
      case 'fuel_tanker':
        return {
          title: 'طلب معايرة فناطيس ونقل الوقود',
          desc: 'يرجى إدخال اسم الشركة أو المقاول ورقم الهاتف ورفع تراخيص السيارة والمقطورة وشهادة العيار.',
          icon: Truck
        };
      default:
        return { title: 'تقديم طلب جديد', desc: '', icon: FileText };
    }
  };

  const formMeta = getFormTitle();
  const FormHeaderIcon = formMeta.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right animate-fade-in">
      
      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <button
          onClick={handleResetSelection}
          className="inline-flex items-center gap-2 text-sm font-bold text-gov-primary hover:text-gov-dark transition-colors bg-gov-light px-4 py-2 rounded-xl"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تغيير نوع الطلب (اختر نوع الطلب)</span>
        </button>

        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {selectedType === 'company' && 'تصنيف: شركات ومصانع'}
          {selectedType === 'fuel_station' && 'تصنيف: محطات وقود'}
          {selectedType === 'fuel_tanker' && 'تصنيف: فناطيس نقل وقود'}
        </span>
      </div>

      {/* Page Title */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex p-3.5 bg-gov-light rounded-2xl text-gov-primary">
          <FormHeaderIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gov-dark">{formMeta.title}</h1>
        <p className="text-gray-500 max-w-xl mx-auto font-light text-sm">
          {formMeta.desc}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex gap-3 items-start animate-shake">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* REQUEST TYPE 1 & 2: COMPANIES / FUEL STATIONS */}
        {(selectedType === 'company' || selectedType === 'fuel_station') && (
          <>
            {/* Card 1: Details */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3 leading-none mb-2">
                {selectedType === 'company' ? 'بيانات المنشأة التجارية والمسؤول' : 'بيانات محطة الوقود والمسؤول'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput(
                  selectedType === 'company' ? 'اسم الشركة بالكامل' : 'اسم المحطة بالكامل',
                  'companyName',
                  Building
                )}
                {renderInput('اسم المسؤول المكلف بالطلب', 'responsiblePerson', User)}
                {renderInput('رقم الهاتف للتواصل المباشر', 'phone', Phone, 'tel')}
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {renderInput(
                  selectedType === 'company' ? 'العنوان التفصيلي للشركة' : 'العنوان التفصيلي للمحطة',
                  'address',
                  MapPin
                )}
              </div>

              {/* Notes Field */}
              <div className="flex flex-col gap-2 text-right pt-2">
                <label className="text-sm font-semibold text-gray-700">ملاحظات إضافية</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أي تفاصيل أو متطلبات خاصة ترغب بذكرها..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gov-dark focus:outline-none"
                />
              </div>
            </div>

            {/* Card 2: Required Attachments */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3 leading-none mb-2">
                المستندات والمرفقات الرسمية المطلوبة
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                المستندات المسموح بها: PDF, JPG, PNG (الحد الأقصى لكل ملف 5 ميجابايت).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {renderFileUpload('طلب الدمغ والمعايرة', 'requestFile')}
                {renderFileUpload('طلب التفويض', 'authorizationFile')}
                {renderFileUpload('السجل التجاري', 'commercialRegisterFile')}
                {renderFileUpload('البطاقة الضريبية', 'taxCardFile')}
              </div>
            </div>
          </>
        )}

        {/* REQUEST TYPE 3: FUEL TANKERS (فناطيس نقل الوقود) */}
        {selectedType === 'fuel_tanker' && (
          <>
            {/* Card 1: Details */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3 leading-none mb-2">
                بيانات مالك أو مقاول الفنطاس
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('اسم الشركة أو المقاول', 'companyName', User)}
                {renderInput('رقم الهاتف', 'phone', Phone, 'tel')}
              </div>

              {/* Notes Field */}
              <div className="flex flex-col gap-2 text-right pt-2">
                <label className="text-sm font-semibold text-gray-700">ملاحظات إضافية</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أي تفاصيل أو متطلبات خاصة ترغب بذكرها..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gov-dark focus:outline-none"
                />
              </div>
            </div>

            {/* Card 2: Required Attachments */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3 leading-none mb-2">
                المستندات والتراخيص المطلوبة للفنطاس
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                المستندات المسموح بها: PDF, JPG, PNG (الحد الأقصى لكل ملف 5 ميجابايت).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {renderFileUpload('طلب الدمغ والمعايرة', 'requestFile')}
                {renderFileUpload('صورة شهادة العيار', 'calibrationCertificateFile')}
                {renderFileUpload('رخصة السيارة', 'vehicleLicenseFile')}
                {renderFileUpload('رخصة المقطورة', 'trailerLicenseFile')}
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-10 py-4 bg-gov-primary hover:bg-gov-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg focus:outline-none"
          >
            {isLoading ? 'جاري إرسال الطلب والمستندات...' : 'إرسال طلب المعايرة والدمغ'}
          </button>
        </div>

      </form>
    </div>
  );
}
