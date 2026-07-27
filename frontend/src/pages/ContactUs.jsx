import React, { useState } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });

    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      setStatusMsg({ type: 'error', text: 'يرجى تعبئة كافة حقول النموذج لإرسال الرسالة' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/messages`, formData);

      if (response.data.success) {
        setStatusMsg({ type: 'success', text: response.data.message });
        setFormData({ name: '', phone: '', subject: '', message: '' });
      } else {
        setStatusMsg({ type: 'error', text: response.data.message || 'فشل إرسال الرسالة' });
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'خطأ في الاتصال بالخادم. يرجى إعادة المحاولة لاحقاً.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-right">
      
      {/* Title */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-extrabold text-gov-dark">اتصل بمكتب التفتيش</h1>
        <p className="text-gray-500 max-w-xl mx-auto font-light">
          نحن هنا لمساعدتكم. يمكنكم التواصل معنا عبر القنوات الرسمية أو تعبئة النموذج أدناه لإرسال استفسار فني أو شكوى مباشرة للمكتب.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Info Cards - Col 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-gov-dark flex items-center gap-2 border-r-4 border-gov-gold pr-2.5">
              <span>القنوات الرسمية للتواصل</span>
            </h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              يمكنكم الاتصال المباشر بمكاتبنا بمدينة العبور خلال المواعيد الرسمية:
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="bg-gov-light p-2.5 rounded-xl text-gov-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">العنوان الجغرافي</span>
                  <span className="text-sm font-semibold text-gray-700 leading-normal">
                    اعلى الشهر العقاري سوق العبور ، مصر
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gov-light p-2.5 rounded-xl text-gov-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">أرقام الهواتف </span>
                  <span className="text-sm font-extrabold text-gov-dark font-mono block">
                    02-01006980351 / 02-01018049361
                  </span>
                </div>
              </div>

              
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
            <h3 className="text-lg font-bold text-gov-dark flex items-center gap-2 border-r-4 border-gov-gold pr-2.5">
              <Clock className="w-5 h-5 text-gov-gold" />
              <span>مواعيد الحضور والمراجعة</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              يستقبل مكتب التفتيش مندوبي الشركات يومياً من الأحد إلى الخميس من الساعة <strong>8:30 صباحاً</strong> وحتى الساعة <strong>3:00 مساءً</strong>.
            </p>
          </div>

        </div>

        {/* Message Form - Col 7 */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gov-primary border-r-4 border-gov-gold pr-3 leading-none mb-2">
            نموذج المراسلة والشكاوى الإلكتروني
          </h3>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            سيتم توجيه رسالتكم مباشرة إلى قسم الإدارة والمتابعة بمكتب العبور، وسنقوم بالرد عليكم عبر الهاتف المذكور في أسرع وقت.
          </p>

          {statusMsg.text && (
            <div className={`p-4 rounded-xl text-sm flex gap-3 items-start animate-fade-in ${
              statusMsg.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
              <span className="font-semibold">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">الاسم بالكامل *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="الاسم الثلاثي لمقدم الرسالة"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">رقم الهاتف للتواصل *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="رقم الهاتف للتواصل المباشر"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none font-mono"
                  required
                />
              </div>

            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">موضوع الرسالة *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="مثال: استفسار عن تكلفة دمغ ميزان عبور بسكول"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">نص الرسالة أو الشكوى *</label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="يرجى كتابة تفاصيل رسالتك بوضوح ودقة..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gov-primary hover:bg-gov-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all focus:outline-none disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة للإدارة</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
