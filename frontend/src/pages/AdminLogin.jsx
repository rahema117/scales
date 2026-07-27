import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminEmail', response.data.admin.email);
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(response.data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'بيانات الدخول غير صحيحة أو خطأ في الاتصال بخادم قاعدة البيانات'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-right relative overflow-hidden select-none bg-gradient-to-tr from-gov-light to-[#f0f9f4]">
      {/* Background circular decorations */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-gov-secondary/5 rounded-full pointer-events-none blur-3xl"></div>
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-gov-gold/5 rounded-full pointer-events-none blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden relative z-10">
        
        {/* Top Header Card */}
        <div className="bg-gov-dark text-white p-8 text-center border-b-4 border-gov-gold space-y-4">
          <div className="mx-auto w-16 h-16 bg-white p-1 rounded-2xl border border-gov-gold/30 flex items-center justify-center shadow-md">
            <img src="/logo.jpg" alt="شعار مصلحة دمغ المصوغات والموازين" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">بوابة الموظفين والمفتشين الآمنة</h2>
            <p className="text-xs text-gov-gold/90 mt-1.5">مكتب موازين العبور • وزارة التموين</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex gap-2.5 items-start animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500">البريد الإلكتروني الوظيفي</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@obour-scales.gov.eg"
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none font-mono"
                  required
                />
                <div className="absolute right-4 top-3.5 text-gray-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500">كلمة المرور الآمنة</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-gov-primary focus:bg-white focus:ring-2 focus:ring-gov-primary/10 transition-all text-right font-medium text-gray-800 focus:outline-none"
                  required
                />
                <div className="absolute right-4 top-3.5 text-gray-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-gov-primary hover:bg-gov-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all focus:outline-none disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحقق من الهوية...</span>
                </>
              ) : (
                <span>دخول لوحة التحكم</span>
              )}
            </button>

          </form>

          <div className="border-t border-gray-100 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gov-primary transition-colors focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للموقع العام للجمهور</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
