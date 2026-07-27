import React, { useState } from 'react';
import { Download, FileText, Search, FileCheck, Building, Fuel, Truck, ShieldCheck, ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DownloadForms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formsData = [
    {
      id: 'form-1',
      title: 'طلب الدمغ والمعايرة  للمنشآت',
      category: 'company',
      fileType: 'PDF',
      size: '1.2 MB',
      updatedAt: '2026-01-15',
      desc: 'النموذج المعتمد الموجه لرئيس مكتب  موازين العبور لطلب دمغ ومعايرة الموازين التجارية والبسكول.',
      icon: Building,
      popular: true
    },
    {
      id: 'form-2',
      title: 'طلب تفويض المندوب المعتمد',
      category: 'company',
      fileType: 'DOCX',
      size: '450 KB',
      updatedAt: '2026-01-10',
      desc: 'صيغة التفويض الرسمي الرسمية لإنابة المندوب في إنهاء إجراءات الفحص والدمغ بالمكتب .',
      icon: FileCheck,
      popular: true
    },
    {
      id: 'form-3',
      title: 'طلب معايرة ودمغ محطات الوقود',
      category: 'fuel_station',
      fileType: 'PDF',
      size: '1.5 MB',
      updatedAt: '2026-02-01',
      desc: 'استمارة تقديم طلب فحص ومعايرة مضخات الوقود للمحطات البترولية.',
      icon: Fuel,
      popular: false
    },
    {
      id: 'form-4',
      title: 'طلب معايرة صهاريج وفناطيس نقل الوقود',
      category: 'fuel_tanker',
      fileType: 'PDF',
      size: '1.8 MB',
      updatedAt: '2026-02-10',
      desc: 'النموذج الخاص بمعايرة فناطيس وصهاريج المواد البترولية .',
      icon: Truck,
      popular: true
    },
    
    {
      id: 'form-6',
      title: 'طلب استخراج شهادة المعايرة والدمغ السنوي',
      category: 'company',
      fileType: 'PDF',
      size: '1.1 MB',
      updatedAt: '2026-01-05',
      desc: 'نموذج استخراج شهادات المعايرة للموازين التي تم دمغها بالمكتب .',
      icon: FileText,
      popular: false
    }
  ];

  const categories = [
    { id: 'all', name: 'جميع النماذج' },
    { id: 'company', name: 'الشركات والمصانع' },
    { id: 'fuel_station', name: 'محطات الوقود' },
    { id: 'fuel_tanker', name: 'فناطيس نقل الوقود' },
    { id: 'technical', name: 'الإقرارات والمواصفات' }
  ];

  const filteredForms = formsData.filter((form) => {
    const matchesSearch = form.title.includes(searchQuery) || form.desc.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (formTitle, fileType) => {
    const dummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (${formTitle}) /Author (Obour Scales Office) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formTitle}.${fileType.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right select-none animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 bg-gov-light rounded-2xl text-gov-primary shadow-xs">
          <Download className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-dark">تحميل النماذج والمستندات الرسمية</h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-light text-sm sm:text-base leading-relaxed">
          يمكنكم تحميل النماذج الرسمية المعتمدة مجانًا وتعبئتها قبل رفعها عبر بوابة تقديم الطلبات الإلكترونية.
        </p>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 mb-10">
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم النموذج أو الاستمارة..."
            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <div className="absolute right-4 top-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 focus:outline-none ${
                selectedCategory === cat.id
                  ? 'bg-gov-primary text-gov-gold shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Printable Form Cards */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-light">
          لا توجد نماذج تطابق بحثك الحالي.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredForms.map((form) => {
            const Icon = form.icon;
            return (
              <div
                key={form.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Popular Tag */}
                {form.popular && (
                  <span className="absolute top-4 left-4 bg-gov-goldLight text-gov-dark text-[10px] font-extrabold px-3 py-1 rounded-full shadow-2xs">
                    الأكثر استخدامًا
                  </span>
                )}

                <div className="space-y-4">
                  {/* Icon & File Tag */}
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 bg-gov-light text-gov-primary rounded-2xl group-hover:bg-gov-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                      {form.fileType} • {form.size}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-bold text-gov-dark group-hover:text-gov-primary transition-colors leading-snug">
                      {form.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-light leading-relaxed mt-2">
                      {form.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Download Action */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono">
                    تحديث: {form.updatedAt}
                  </span>
                  <button
                    onClick={() => handleDownload(form.title, form.fileType)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gov-primary hover:bg-gov-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none active:scale-95"
                  >
                    <ArrowDownCircle className="w-4 h-4 text-gov-gold" />
                    <span>تحميل الملف</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Box linking to New Request */}
      <div className="mt-16 bg-gradient-to-r from-gov-dark to-gov-primary text-white rounded-3xl p-8 border-b-4 border-gov-gold shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-right">
          <h3 className="text-xl font-bold">هل قمت بتعبئة النموذج المطلوب؟</h3>
          <p className="text-xs sm:text-sm text-gray-200 font-light">
            يمكنك الآن الانتقال إلى صفحة تقديم الطلب الإلكتروني ورفع الملفات لإتمام إجراءات المعايرة.
          </p>
        </div>
        <Link
          to="/new-request"
          className="px-6 py-3 bg-gov-gold hover:bg-gov-gold/90 text-gov-dark font-bold rounded-xl shadow-md transition-all shrink-0 text-sm"
        >
          تقديم الطلب الآن
        </Link>
      </div>

    </div>
  );
}
