import React, { useState } from 'react';
import { Award, BookOpen, ShieldCheck, Layers, CheckCircle2, ChevronLeft, Info, Scale, Fuel, Truck, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TechnicalStandards() {
  const [activeTab, setActiveTab] = useState('all');

  const standards = [
    {
      id: 'oiml-r76',
      code: 'OIML R76',
      title: 'الموازين غير التلقائية (Non-Automatic Weighing Instruments)',
      category: 'weighing',
      icon: Scale,
      badge: 'موازين التجار والبسكول',
      summary: 'المواصفة الدولية الأساسية الحاكمة لتصنيف وتفتيش واختبار كافة أجهزة الموازين غير التلقائية المستخدمة في الأسواق التجارية والمصانع وموازين الشاحنات (البسكول).',
      points: [
        'تصنيف الموازين إلى 4 فئات دقة قياسية: Class I (دقيقة جداً)، Class II (دقيقة)، Class III (تجارية عامة)، Class IIII (صناعية ثقيلة).',
        'تحديد حدود الخطأ المسموح به (Maximum Permissible Error - MPE) في مرحلة الفحص الأولي ومرحلة التفتيش الدوري.',
        'اشتراطات الحماية ضد التلاعب والأختام الرصاصية أو الإلكترونية المانعة لفك معايرة الميزان.',
        'اختبارات التكرارية (Repeatability)، والتحميل غير المركزي (Eccentricity)، والانسياق مع تغيير درجات الحرارة.'
      ],
      scope: 'الموازين التجارية، موازين الطبلية، موازين البسكول 60-100 طن، موازين المختبرات.'
    },
    {
      id: 'oiml-r117',
      code: 'OIML R117',
      title: 'أنظمة قياس السوائل المستمرة بخلاف الماء (Dynamic Measuring Systems)',
      category: 'liquids',
      icon: Fuel,
      badge: 'مضخات ومحطات الوقود',
      summary: 'المواصفة القياسية الخاصة بأنظمة القياس الديناميكية الحجمية والكتلية للسوائل البترولية والمشتقات الهيدروكربونية بمحطات الخدمة.',
      points: [
        'معايير دقة قياس عدادات ومضخات الوقود (البنزين والسولار) بفئات دقة 0.3% و0.5%.',
        'اشتراطات أجهزة فصل الهواء والغازات المرافقة لضمان قياس خالي من الفقاعات الهوائية.',
        'معايرة الحاسبة الإلكترونية ومبينات السعر والحجم ومطابقتها للكمية الضخ الفعلية.',
        'مؤشرات الأمان وختم حواسب المضخات لمنع أي تعديل إلكتروني غير مصرح به في النبضات (Pulses).'
      ],
      scope: 'مضخات محطات التزويد بالوقود، العدادات الحجمية للمستودعات، موزع المشتقات البترولية.'
    },
    {
      id: 'oiml-r81',
      code: 'OIML R81',
      title: 'أجهزة قياس صهاريج وفناطيس نقل السوائل (Transportable Tank Measures)',
      category: 'tankers',
      icon: Truck,
      badge: 'فناطيس نقل الوقود',
      summary: 'المواصفة الدولية الخاصة بمعايرة وإصدار جدول السعة المقاسة لصهاريج وفناطيس نقل المواد السائلة والبترولية ذات السعات العالية.',
      points: [
        'تحديد السعة الاسمية والحجم الكلي لكل مقصورة (Compartment) بالفنطاس باستخدام أجهزة المعايرة المعتمدة.',
        'تحديد مستوى علامة العيار (Dome Gauge Mark) وتثبيت مسطرة القياس أو مؤشر الارتفاع القياسي.',
        'حساب معامل التمدد الحراري واختبار الاستقرار الهيكلي للصهريج عند الامتلاء والتفريغ.',
        'إصدار جدول شهادة العيار الرسمي المعتمد المرفق برخصة الفنطاس والمقطورة.'
      ],
      scope: 'صهاريج وفناطيس نقل البنزين والسولار، تانكات نقل المواد الكيميائية السائلة.'
    },
    {
      id: 'oiml-r139',
      code: 'OIML R139',
      title: 'أنظمة قياس وقود الغازات المضغوطة (Compressed Gaseous Fuel Systems)',
      category: 'gas',
      icon: Flame,
      badge: 'موزعات غاز السيارات (CNG)',
      summary: 'المواصفة القياسية الحديثة لقياس كتلة الغاز الطبيعي المضغوط (CNG) والغازات الصناعية المضغوطة المقدمة للمركبات.',
      points: [
        'قياس الكتلة المباشر باستخدام عدادات تدفق كوريوليس (Coriolis Mass Flowmeters).',
        'حدود الخطأ الأقصى المسموح به ±1.5% إلى ±2.0% نظراً لظروف الضغط العالي والحرارة.',
        'اشتراطات السلامة والتحكم التلقائي عند انقطاع التغذية أو تسريب الضغط أثناء المعايرة.',
        'التحقق من حواسب تسعير الغاز المضغوط ومطابقتها للكتلة الموردة بالكيلوجرام.'
      ],
      scope: 'محطات تموين السيارات بالغاز الطبيعي المضغوط (CNG)، موزعات الغاز الصناعي.'
    }
  ];

  const filteredStandards = standards.filter((std) => {
    if (activeTab === 'all') return true;
    return std.category === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right select-none animate-fade-in">
      
      {/* Page Title */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 bg-gov-light rounded-2xl text-gov-primary shadow-xs">
          <BookOpen className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-dark">المواصفات الفنية والمقاييس الدولية</h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-light text-sm sm:text-base leading-relaxed">
          ملخص الدلائل والمواصفات القياسية الدولية (OIML) المعتمدة بمكتب تفتيش موازين العبور لفحص ومعايرة أجهزة الوزن والقياس.
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-2 justify-center max-w-3xl w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'all' ? 'bg-gov-primary text-gov-gold shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            جميع المواصفات
          </button>
          <button
            onClick={() => setActiveTab('weighing')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'weighing' ? 'bg-gov-primary text-gov-gold shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            OIML R76 (الموازين)
          </button>
          <button
            onClick={() => setActiveTab('liquids')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'liquids' ? 'bg-gov-primary text-gov-gold shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            OIML R117 (مضخات الوقود)
          </button>
          <button
            onClick={() => setActiveTab('tankers')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tankers' ? 'bg-gov-primary text-gov-gold shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            OIML R81 (الفناطيس)
          </button>
          <button
            onClick={() => setActiveTab('gas')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'gas' ? 'bg-gov-primary text-gov-gold shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            OIML R139 (الغاز المضغوط)
          </button>
        </div>
      </div>

      {/* Standards Cards */}
      <div className="space-y-8">
        {filteredStandards.map((std) => {
          const Icon = std.icon;
          return (
            <div
              key={std.id}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-6 relative overflow-hidden"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gov-light text-gov-primary rounded-2xl shrink-0">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold text-gov-primary font-mono">{std.code}</span>
                      <span className="px-3 py-1 bg-gov-goldLight text-gov-dark rounded-full text-xs font-bold">
                        {std.badge}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gov-dark mt-1">{std.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                    منظمة القانون الدولي للقياس (OIML)
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                {std.summary}
              </p>

              {/* Key Technical Requirements (Bullet Points) */}
              <div className="bg-gray-50/80 p-6 rounded-2xl space-y-3 border border-gray-100">
                <h4 className="font-bold text-xs text-gov-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gov-gold" />
                  <span>أبرز الاشتراطات والمتطلبات الفنية للمواصفة:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                  {std.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-gov-secondary shrink-0 mt-1" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope of Application */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <Info className="w-4 h-4 text-gov-gold shrink-0" />
                <span>
                  <strong>نطاق التطبيق بمدينة العبور:</strong> {std.scope}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Notice Banner */}
      <div className="mt-12 p-6 bg-gov-light/50 border border-gov-primary/10 rounded-2xl flex items-center gap-4 text-sm text-gov-dark">
        <Award className="w-8 h-8 text-gov-gold shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold">هل ترغب بالاطلاع على اللائحة الفنية الكاملة؟</h4>
          <p className="text-xs text-gray-500 font-light">
            تتوفر كافة المراجع والكتيبات الاسترشادية الخاصة بمواصفات الهيئة المصرية العامة للمواصفات والجودة بمقر مكتب التفتيش بالعبور.
          </p>
        </div>
      </div>

    </div>
  );
}
