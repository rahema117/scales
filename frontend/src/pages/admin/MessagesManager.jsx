import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, PhoneCall, Calendar, User, MessageSquare, Loader2, Inbox } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMessages = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        setErrorMsg('فشل تحميل رسائل المنصة');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('خطأ في الاتصال بالخادم لتحميل صندوق الرسائل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6 text-right select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gov-dark">وارد صندوق المراسلات والشكاوى</h1>
        <p className="text-xs text-gray-500 mt-1">مراجعة رسائل الاستفسارات والشكاوى الفنية الواردة من العملاء عبر الموقع العام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MESSAGES LIST - Col 7 */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Loader2 className="w-8 h-8 text-gov-primary animate-spin" />
              <span className="text-xs text-gray-400">جاري تحميل رسائل الوارد...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-light text-sm flex flex-col items-center gap-3">
              <Inbox className="w-10 h-10 text-gray-300" />
              <span>صندوق الوارد فارغ تماماً حالياً.</span>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                    selectedMessage?._id === msg._id
                      ? 'bg-gov-light/40 border-gov-gold/50 border-r-4 border-r-gov-gold'
                      : 'bg-white border-gray-100 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gov-primary flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gov-gold" />
                      <span>{msg.name}</span>
                    </span>
                    <span className="text-gray-400 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-800 text-sm mt-1">{msg.subject}</h4>
                  
                  <p className="text-xs text-gray-500 line-clamp-1 leading-normal font-light">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS PANEL - Col 5 */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 min-h-[350px]">
          {selectedMessage ? (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Header */}
              <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-gov-dark">{selectedMessage.name}</h3>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="inline-flex items-center gap-1 text-[11px] text-gov-primary hover:underline font-mono mt-1 font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-gov-gold" />
                    <span>{selectedMessage.phone}</span>
                  </a>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md font-mono">
                  {new Date(selectedMessage.createdAt).toLocaleString('ar-EG')}
                </span>
              </div>

              {/* Message Details */}
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold block">موضوع الرسالة:</span>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 font-bold text-gray-800 text-xs">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold block">محتوى الرسالة بالكامل:</span>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-gray-700 leading-relaxed font-medium text-xs whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply info reminder */}
                <div className="bg-gov-light/40 border border-gov-primary/10 rounded-xl p-3 flex gap-2 text-[10px] text-gov-dark items-start leading-normal">
                  <span>💡</span>
                  <span>لا يوجد ربط بريدي خارجي، نوصي بالتواصل الهاتفي الفوري مع صاحب الرسالة على الرقم ({selectedMessage.phone}) للرد على استفساره أو إفادته بخصوص شكواه.</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-24 text-gray-400 font-light text-center gap-3">
              <Mail className="w-12 h-12 text-gray-300 animate-pulse" />
              <span>اختر رسالة من القائمة بالجانب لمراجعة محتواها وبيانات المرسل للرد والتنسيق.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
