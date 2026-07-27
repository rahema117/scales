import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right select-none animate-fade-in">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 bg-gov-light rounded-2xl text-gov-primary shadow-xs">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-gov-dark">سياسة الخصوصية وحماية البيانات الرسمية</h1>
        <p className="text-gray-500 max-w-xl mx-auto font-light text-sm">
          التزام مصلحة الدمغ والموازين وحماية البيانات الرقمية للمؤسسات والشركات والمواطنين المتعاملين مع مكتب العبور.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8 text-gray-700 leading-relaxed font-light">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3">1. جمع البيانات والمعلومات</h2>
          <p className="text-sm">
            يقوم النظام الإلكتروني بجمع البيانات الأساسية الضرورية لإنهاء إجراءات التفتيش والدمغ فقط، وتشمل: اسم الشركة أو المنشأة، اسم المسؤول المكلف بالطلب، رقم الهاتف، والمستندات الرسمية المرفوعة (مثل طلب الدمغ وتفويض المندوب والسجل التجاري والتراخيص).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3">2. حماية وتشفير المستندات</h2>
          <p className="text-sm">
            تخضع جميع الملفات والمستندات الرسمية المرفوعة عبر البوابة لبروتوكولات حماية عالية التشفير، ويقتصر الاطلاع عليها فقط على مفتشي وموظفي مكتب تفتيش موازين العبور المعتمدين لإنهاء المعاملة الفنية.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3">3. استخدام بيانات التواصل</h2>
          <p className="text-sm">
            تُستخدم أرقام الهواتف المدخلة لإرسال الإشعارات ومواعيد الزيارات وحالات مراجعة الطلب فقط، ولن يتم استخدام بياناتكم لأي أغراض تجارية أو ترويحية أخرى.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3">4. حقوق المستخدم والمنشأة</h2>
          <p className="text-sm">
            يحق لكل منشأة الاستعلام عن حالة طلبها وتعديل المستندات في حال طلب استكمال الأوراق الناقصة من قِبل موظف التفتيش، وذلك عبر إدخال رقم الطلب المخصص.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>آخر تحديث: يوليو 2026</span>
          <Link to="/" className="text-gov-primary font-bold hover:underline flex items-center gap-1">
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}
