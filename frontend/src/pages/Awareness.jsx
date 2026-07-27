import React, { useState } from 'react';
import { BookOpen, ShieldCheck, HeartHandshake, RefreshCw, Award, CheckCircle2, ChevronLeft, ArrowRight, Sparkles, Scale, Info, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Awareness() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const articles = [
    {
      id: 'article-1',
      title: 'كيف تتأكد أن الميزان قانوني؟',
      category: 'للمستهلك والتاجر',
      readTime: '3 دقائق',
      icon: ShieldCheck,
      badge: 'إرشادات هامة',
      summary: 'خطوات إرشادية بسيطة وعلامات رئيسية تمكّنك من معرفة مدى سلامة الميزان ووجود ختم الدمغ الحكومي المعتمد.',
      content: [
        {
          heading: '1. وجود خاتم وشارة الدمغ الرسمية',
          text: 'تأكد من وجود ملصق أو ختم الرصاصة المعتمد من مصلحة دمغ المصوغات والموازين مثبتًا بشكل واضح على جسم الميزان أو اللوحة الرئيسية دون تدمير أو خدوش.'
        },
        {
          heading: '2. قراءة الصفر (Zero Test) قبل بدء الوزن',
          text: 'تأكد من أن شاشة الميزان أو المؤشر يشير تمامًا إلى الصفر (0.000) قبل وضع أي بضاعة عليه، وألا يكون التاجر قد وضع أوزانًا إضافية أو مفرشًا ثقيلاً على الكفة.'
        },
        {
          heading: '3. ثبات واستقرار الميزان',
          text: 'يجب أن يكون الميزان موضوعًا على سطح أملس وأفقي تمامًا وغير مائل، حيث أن ميلان الميزان يؤثر بشكل مباشر على دقة القراءة الفعلية.'
        }
      ]
    },
    {
      id: 'article-2',
      title: 'حقوق المستهلك والتاجر',
      category: 'التشريعات وحماية الحقوق',
      readTime: '4 دقائق',
      icon: HeartHandshake,
      badge: 'حقوق وواجبات',
      summary: 'دليل شامل يوضح الحقوق القانونية للمستهلك في الحصول على الوزن الصافي، والتزامات التاجر بالمعايرة الدورية.',
      content: [
        {
          heading: 'حقوق المستهلك:',
          text: 'الحصول على الوزن الصافي الفعلي للبضاعة بدون احتساب وزن الأكياس أو العبوات الثقيلة (الترا). يحق للمستهلك طلب إعادة وزن أي سلعة يشك في وزنها أمام التاجر أو إبلاغ مكتب التفتيش.'
        },
        {
          heading: 'التزامات التاجر والشركات:',
          text: 'الالتزام بتقديم الموازين للمعايرة والدمغ بشكل دوري سنوياً قبل انتهاء فترة الصلاحية. يمنع منعاً باتاً استخدام موازين غير مدموغة أو موازين منزلية شخوصية في المعاملات التجارية.'
        },
        {
          heading: 'العقوبات القانونية',
          text: 'طبقا للقانون رقم 1 لسنة 1994 فإن عقوبة حيازة واستعمال اجهزة غير مدموغة هي الحبس مدة لا تقل عن 3 شهور ولا تزيد عن سنة'
        }
      ]
    },
    {
      id: 'article-3',
      title: 'أهمية المعايرة الدورية للموازين',
      category: 'القطاع الصناعي والتجاري',
      readTime: '3 دقائق',
      icon: RefreshCw,
      badge: 'حماية الأرباح',
      summary: 'لماذا تعتبر المعايرة السنوية استثمارًا أساسيًا يضمن دقة خطوط الإنتاج والحد من الفروق المالية التراكمية.',
      content: [
        {
          heading: 'منع الخسائر المالية غير المنظورة',
          text: 'خطأ صغير في الميزان قدره 10 جرامات قد يتحول خلال عام كامل إلى أطنان من المواد الخام الضائعة، مما يسبب خسائر مالية فادحة للمصانع والمنشآت التجارية.'
        },
        {
          heading: 'ضمان جودة وتماثل المنتجات',
          text: 'في خلطات البلاستيك والمواد الكيميائية والأغذية، تعتبر دقة النسب شرطًا أساسيًا لمطابقة المنتج للمواصفات القياسية المصرية والعالمية.'
        },
        {
          heading: 'الوقاية من الغرامات وتوقف النشاط',
          text: 'إجراء المعايرة الدورية يجنب المنشأة الوقوع تحت طائلة مخالفات التفتيش المفاجئ وتراكم غرامات التأخير والتعرض للحبس ومصادرة الموازين.'
        }
      ]
    },
    {
      id: 'article-4',
      title: 'لماذا تتم أعمال الدمغ والختم الحكومي؟',
      category: 'الثقافة Metrology',
      readTime: '3 دقائق',
      icon: Award,
      badge: 'الثقة الوطنية',
      summary: 'الهدف الوطني والشرعي والتجاري للرقابة الحكومية على أجهزة القياس وتوفير بيئة منافسة عادلة.',
      content: [
        {
          heading: 'إرساء العدالة في التعاملات التجارية',
          text: 'تضمن أعمال الدمغ استقرار البيئة التجارية الوطنية، حيث يثق كل من البائع والمشتري في صحة القراءات والأرقام المسجلة.'
        },
        {
          heading: 'حماية وتكافؤ الفرص في الأسواق',
          text: 'تمنع أعمال الدمغ المنافسة غير المشروعة القائمة على خفض الأسعار الصورية وتعويضها بنقص الوزن الصافي للبضائع.'
        },
        {
          heading: 'السيادة والترخيص الرسمي',
          text: 'يعتبر خاتم الدمغ الحكومي الشارة الرسمية الوحيدة المعترف بها أمام الهيئات القضائية والرقابية والجهات الدولية عند التصدير.'
        }
      ]
    },
    {
      id: 'article-5',
      title: '🛠️ من يحق له صيانة الموازين؟',
      category: 'الترخيص والصيانة',
      readTime: '4 دقائق',
      icon: Wrench,
      badge: 'ترخيص وصيانة',
      summary: 'لا يجوز قانونًا ممارسة مهنة صناعة أو صيانة الموازين إلا بعد الحصول على ترخيص من مصلحة دمغ المصوغات والموازين. تعرف على أهمية التعامل مع صانع موازين مرخص ودوره في تجهيز الميزان قبل التحقق القانوني والدمغ.',
      content: [
        {
          heading: 'الترخيص القانوني لممارسة المهنة',
          text: 'تُعد أعمال صناعة وصيانة الموازين من المهن الفنية المنظمة قانونًا، لما لها من تأثير مباشر على دقة القياس وحماية حقوق المستهلك والتاجر. لذلك نصت المادة (16) من القانون رقم (1) لسنة 1994 على أنه يحظر ممارسة مهنة صناعة أو صيانة الموازين دون الحصول على ترخيص من مصلحة دمغ المصوغات والموازين.'
        },
        {
          heading: 'شروط اجتياز الترخيص والعقوبة',
          text: 'ويُمنح هذا الترخيص بعد اجتياز الاختبارات الفنية التي تجريها المصلحة، للتأكد من كفاءة المتقدم وقدرته على تنفيذ أعمال الصيانة والضبط وفقًا للمعايير الفنية المعتمدة. كما نص القانون على عقوبة الحبس لمدة تصل إلى ستة أشهر لكل من يخالف أحكام المادة (16) ويمارس المهنة دون ترخيص.'
        },
        {
          heading: 'لماذا يجب الاستعانة بصانع موازين مرخص؟',
          text: 'لأن صانع الموازين المرخص هو الشخص المؤهل للقيام بـ: صيانة وإصلاح الموازين، ضبط الميزان وإعداده للعمل بصورة صحيحة، معايرة الميزان وتجهيزه وفقًا للاشتراطات الفنية، والتأكد من جاهزية الميزان قبل عرضه على مصلحة دمغ المصوغات والموازين لإجراء التحقق القانوني والدمغ.'
        },
        {
          heading: 'تنبيه مهم',
          text: 'قيام شخص غير مرخص بصيانة أو تجهيز الميزان قد يؤدي إلى عدم اجتيازه إجراءات التحقق القانوني، بالإضافة إلى تعرض من يمارس المهنة دون ترخيص للمساءلة القانونية.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right select-none animate-fade-in">

      {/* Header Title */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 bg-gov-light rounded-2xl text-gov-primary shadow-xs">
          <BookOpen className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-dark">مركز التوعية والتثقيف القياسي</h1>
        <p className="text-gray-500 max-w-2xl mx-auto font-light text-sm sm:text-base leading-relaxed">
          دليلك المعرفي للاطلاع على حقوق المستهلك، والاشتراطات الفنية للموازين القانونية، وأهمية الدمغ الدوري.
        </p>
      </div>

      {/* Article Detail Reader Modal View or Page View */}
      {selectedArticle ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg space-y-8 max-w-4xl mx-auto animate-fade-in">

          <button
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gov-primary bg-gov-light hover:bg-gov-primary hover:text-white transition-all px-4 py-2 rounded-xl"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة المقالات التوعوية</span>
          </button>

          <div className="border-b border-gray-100 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gov-goldLight text-gov-dark font-extrabold text-xs rounded-full">
                {selectedArticle.badge}
              </span>
              <span className="text-xs text-gray-400 font-medium">وقت القراءة: {selectedArticle.readTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gov-dark">{selectedArticle.title}</h2>
            <p className="text-sm text-gray-500 font-light leading-relaxed">{selectedArticle.summary}</p>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed font-light">
            {selectedArticle.content.map((sec, idx) => (
              <div key={idx} className="bg-gray-50/80 p-6 rounded-2xl space-y-2 border border-gray-100">
                <h3 className="text-base font-bold text-gov-primary flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-gov-gold shrink-0" />
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-sm text-gray-600 font-normal leading-relaxed pr-7">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-400">
              مصدر المعلومات: مصلحة الدمغ والموازين - مكتب تفتيش موازين العبور.
            </span>
            <Link
              to="/new-request"
              className="px-6 py-2.5 bg-gov-primary hover:bg-gov-dark text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              تقديم طلب معايرة
            </Link>
          </div>

        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => {
            const Icon = art.icon;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 bg-gov-light text-gov-primary rounded-2xl group-hover:bg-gov-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full group-hover:bg-gov-goldLight group-hover:text-gov-dark transition-colors">
                      {art.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-gov-dark group-hover:text-gov-primary transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-gov-primary font-bold text-xs">
                  <span>قراءة المقال كاملاً ({art.readTime})</span>
                  <div className="w-8 h-8 rounded-full bg-gov-light flex items-center justify-center group-hover:bg-gov-primary group-hover:text-white transition-all transform group-hover:-translate-x-1">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Callout */}
      <div className="mt-16 bg-gradient-to-l from-gov-primary to-gov-dark text-white rounded-3xl p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border-b-4 border-gov-gold">
        <div className="space-y-2 text-right">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gov-gold" />
            <span>معاً من أجل أسواق عادلة وآمنة</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 font-light">
            إذا كان لديك أي شكوى أو شك في سلامة ميزان تجاري بمدينة العبور، يسعدنا استقبال بلاغك مباشرة.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-6 py-3 bg-gov-gold hover:bg-gov-gold/90 text-gov-dark font-bold rounded-xl shadow-md transition-all shrink-0 text-sm"
        >
          تقديم بلاغ أو تواصل معنا
        </Link>
      </div>

    </div>
  );
}
