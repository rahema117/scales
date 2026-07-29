import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Scale, 
  Truck, 
  Fuel, 
  Ruler, 
  Package,
  Award, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  BookOpen, 
  HeartHandshake,
  ArrowLeft
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const services = [
    {
      title: 'التحقق والدمغ للموازين الإلكترونية والميكانيكية',
      desc: 'التحقق من مطابقة الموازين الإلكترونية والميكانيكية للاشتراطات القانونية، وإجراء الدمغ القانوني للأجهزة المطابقة.',
      icon: Scale
    },
    {
      title: 'التحقق والدمغ لموازين البسكول',
      desc: 'التحقق القانوني لموازين البسكول المستخدمة في الأنشطة التجارية والصناعية، وإجراء الدمغ بعد اجتياز الفحص.',
      icon: Truck
    },
    {
      title: 'التحقق والدمغ لطلمبات الوقود',
      desc: 'فحص طلمبات الوقود للتأكد من دقة كمية الوقود المصروفة، وإجراء الدمغ القانوني للطلمبات المطابقة.',
      icon: Fuel
    },
    {
      title: 'التحقق والدمغ لسيارات نقل الوقود',
      desc: 'التحقق من خزانات ومقاييس سيارات نقل الوقود والتأكد من مطابقتها للاشتراطات القانونية وإجراء الدمغ.',
      icon: ShieldCheck
    },
    {
      title: 'التحقق والدمغ لأدوات القياس',
      desc: 'التحقق من أدوات القياس القانونية مثل المتر العياري وغيرها من أدوات القياس الخاضعة للقانون، وإجراء الدمغ بعد التأكد من مطابقتها.',
      icon: Ruler
    },
    {
      title: 'التحقق والدمغ لماكينات التعبئة',
      desc: 'التحقق من ماكينات التعبئة المستخدمة في تعبئة المنتجات والتأكد من دقة الكميات المعبأة وإجراء الدمغ القانوني.',
      icon: Package
    }
  ];

  const docs = [
    { title: 'طلب الدمغ والمعايرة الرسمي', desc: 'موقع ومختوم بختم الشركة وموجه لمدير مكتب تفتيش موازين العبور.' },
    { title: 'طلب تفويض المندوب', desc: 'تفويض رسمي باسم المندوب المكلف بإنهاء الإجراءات متضمناً صورة هويته.' },
    { title: 'صورة السجل التجاري', desc: 'يجب أن يكون سارياً ومسجلاً به نشاط الشركة بوضوح.' },
    { title: 'صورة البطاقة الضريبية', desc: 'صورة ضوئية واضحة للبطاقة الضريبية الخاصة بالشركة.' },
  ];

  const steps = [
    { step: '١', title: 'تقديم الطلب إلكترونياً', desc: 'تعبئة بيانات المنشأة ورفع المستندات المطلوبة عبر بوابة الخدمات الإلكترونية.' },
    { step: '٢', title: 'مراجعة المستندات', desc: 'تدقيق الأوراق والمستندات المرفقة من قبل موظفي التفتيش والاعتماد.' },
    { step: '٣', title: 'زيارة المكتب والدفع', desc: 'تحديد موعد لزيارة مكتب العبور لإتمام دفع الرسوم الرسمية والحصول على إيصال التوريد.' },
    { step: '٤', title: 'التفتيش الميداني والدمغ', desc: 'تنفيذ زيارة التفتيش الفني ودمغ الموازين الصالحة وإصدار شهادة المعايرة السنوية.' },
  ];

  const faqs = [
    { q: 'ما هي المدة القانونية لصلاحية دمغ الموازين؟', a: 'تعتبر شهادة الدمغ والمعايرة صالحة لمدة عام كامل (سنة واحدة) من تاريخ تنفيذ المعايرة، وتلتزم الشركة بطلب التجديد قبل انتهاء المدة.' },
    { q: 'ماذا يحدث في حال فوات موعد التجديد السنوي؟', a: 'يتم إشعار الشركة بفوات الموعد، وتتحول حالة الشركة تلقائياً في النظام إلى "متأخرة عن التجديد" مما يعرضها لتطبيق الغرامات القانونية في حال استمرار استخدام الموازين غير المدموغة.' },
    { q: 'ما هي أنواع الملفات المسموح بتحميلها في نموذج الطلب؟', a: 'النظام يدعم تحميل المستندات بصيغ PDF والصور (JPG, PNG) بحجم أقصى 5 ميجابايت للملف الواحد.' },
    { q: 'كيف يمكنني الاستعلام عن حالة طلب المعايرة الخاص بي؟', a: 'من خلال صفحة "الاستعلام عن طلب"، يمكنك البحث باستخدام رقم الطلب الصادر (مثل REQ-2026-0001) للاطلاع على التفاصيل ومواعيد الزيارة.' }
  ];

  return (
    <div className="flex flex-col gap-16 pb-20 gov-watermark select-none">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gov-dark via-gov-primary to-gov-dark text-white py-24 px-4 sm:px-6 lg:px-8 border-b-8 border-gov-gold shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gov-secondary/35 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-gov-gold text-sm font-semibold mb-6 animate-pulse">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>مصلحة دمغ المصوغات والموازين</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
            مكتب موازين العبور
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            خدمات التحقق والدمغ  للموازين التجارية  ومحطات وفناطيس الوقود .
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4.5">
            <Link
              to="/new-request"
              className="w-full sm:w-auto px-8 py-4 bg-gov-gold hover:bg-gov-gold/90 text-gov-dark text-lg font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-gov-gold/25 focus:outline-none"
            >
              تقديم طلب جديد
            </Link>
            <Link
              to="/track"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none"
            >
              الاستعلام عن طلب
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* SECTION: ELECTRONIC SERVICES */}
        <section id="services" className="space-y-10 text-right">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-gov-dark">الخدمات الإلكترونية</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-sm sm:text-base">
              الخدمات التي يمكن التقديم عليها من خلال الموقع الاكتروني
            </p>
          </div>

          {/* Services Cards Grid - 6 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gov-primary/20 transition-all duration-300 text-right flex flex-col gap-3"
                >
                  <div className="bg-gov-light text-gov-primary w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gov-dark leading-snug">{service.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Quick Links Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          <Link
            to="/download-forms"
            className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-600 text-white rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-gov-dark group-hover:text-blue-600 transition-colors">
                تحميل النماذج 
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                استعراض وتحميل النماذج  بصيغ PDF و DOCX.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>تصفح النماذج</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/technical-standards"
            className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-3xl border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-600 text-white rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-gov-dark group-hover:text-amber-600 transition-colors">
                المواصفات الفنية OIML
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                ملخص المواصفات القياسية الدولية (R76, R117, R81, R139) للقياس والمعايرة.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>عرض المواصفات</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/awareness"
            className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-600 text-white rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-gov-dark group-hover:text-emerald-600 transition-colors">
               التوعية والتثقيف
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                مقالات إرشادية حول حقوق المستهلك والتاجر والتأكد من الموازين القانونية.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>اقرأ مقالات التوعية</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </section>

        {/* Section: About */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="flex items-center gap-2 text-gov-primary font-bold text-sm tracking-widest uppercase">
              <span className="h-1 w-8 bg-gov-gold rounded"></span>
            </div>
            <h2 className="text-3xl font-extrabold text-gov-dark leading-tight">
              نبذة عن مكتب موازين العبور
            </h2>
            <p className="text-gray-600 text-base leading-relaxed font-light">
              يُعد مكتب موازين العبور جهة حكومية متخصصة تتبع الإدارة العامة للموازين بمصلحة دمغ المصوغات والموازين، التابعة لوزارة التموين والتجارة الداخلية. ويضطلع المكتب بمسؤولية تنفيذ أعمال المترولوجيا القانونية داخل نطاق اختصاصه، من خلال فحص ومعايرة واعتماد أدوات وأجهزة القياس، وإصدار الشهادات القانونية، وتنفيذ أعمال التفتيش والرقابة على الأسواق، بما يضمن سلامة القياس وعدالة المعاملات التجارية وحماية المستهلك. ويستند المكتب في أداء مهامه إلى أحكام القوانين والقرارات المنظمة، مع الالتزام بتطبيق توصيات المنظمة الدولية للمترولوجيا القانونية (OIML) وأفضل الممارسات الفنية في مجال القياس القانوني.
            </p>
          </div>
        </section>

        {/* Section: Required Documents & Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-8">
          
          {/* Docs Checklist */}
          <section id="documents" className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gov-dark text-right">المستندات المطلوبة لتقديم الطلب</h2>
            <p className="text-gray-500 text-right font-light mb-6">يرجى تجهيز المستندات التالية بصيغة ملفات PDF أو صور واضحة قبل البدء:</p>
            <div className="space-y-4">
              {docs.map((doc, index) => (
                <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-150 shadow-2xs items-start text-right">
                  <div className="bg-gov-gold/15 text-gov-dark font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-gov-dark text-base">{doc.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-normal">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submission Steps */}
          <section id="steps" className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gov-dark text-right">خطوات التقديم والمعايرة الرسمية</h2>
            <p className="text-gray-500 text-right font-light mb-6">مسار رحلتكم الرقمية من تقديم الطلب حتى إتمام الدمغ الفني بنجاح:</p>
            <div className="relative border-r-2 border-gov-gold/30 mr-4 space-y-8 pr-6 text-right">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <span className="absolute -right-[35px] top-0.5 bg-gov-primary text-gov-gold font-bold w-7 h-7 rounded-full flex items-center justify-center text-xs ring-4 ring-[#f8faf9]">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-gov-dark text-base">{step.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Section: FAQ */}
        <section id="faq" className="space-y-8 pt-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-gov-dark">الأسئلة الشائعة</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light">إجابات عن الاستفسارات الأكثر تكراراً من الشركات والمستثمرين بمدينة العبور</p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4.5 text-right font-bold text-gov-dark hover:bg-gray-50 flex justify-between items-center focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gov-gold" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-right text-gray-500 border-t border-gray-50 text-sm leading-relaxed font-light animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Quick Contact Box */}
        <section className="bg-gradient-to-l from-gov-primary to-gov-dark text-white rounded-3xl p-10 shadow-lg text-center relative overflow-hidden border-b-4 border-gov-gold">
          <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-bold">هل لديك استفسار فني أو شكوى؟</h3>
            <p className="max-w-2xl mx-auto text-gray-200 font-light leading-relaxed">
              يسعدنا الإجابة عن استفساراتكم عبر نموذج المراسلات الفنية، أو من خلال تشريفنا بزيارة مكتب التفتيش بمدينة العبور في ساعات العمل الرسمية.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3 bg-gov-gold hover:bg-gov-gold/90 text-gov-dark font-bold rounded-lg shadow-md transition-all focus:outline-none"
              >
                تواصل معنا الآن
              </Link>
              <div className="text-xs text-gray-300">
                أو اتصل بنا مباشرة على الهاتف: <span className="font-semibold text-white">02-01018049361</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
