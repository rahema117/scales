import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Building, CalendarClock, FileBarChart, Inbox, FolderArchive, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

import axios from 'axios';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem('adminToken');
  const adminEmail = localStorage.getItem('adminEmail') || 'مدير النظام';

  // Security Auth Guard Redirect & Interceptor for Token Expiration (401)
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          navigate('/admin/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-right">
        <div className="flex flex-col items-center gap-3">
          <ShieldAlert className="w-12 h-12 text-red-600 animate-pulse" />
          <p className="font-semibold text-gray-700">جاري التحقق من الصلاحيات والتحويل...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'الإحصائيات العامة', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'إدارة الطلبات الإلكترونية', path: '/admin/dashboard/requests', icon: FileText },
    { name: 'سجلات الشركات المعتمدة', path: '/admin/dashboard/companies', icon: Building },
    { name: 'متابعة التجديدات والغرامات', path: '/admin/dashboard/overdue', icon: CalendarClock },
    { name: 'السجلات الورقية', path: '/admin/dashboard/office-records', icon: FolderArchive },
    { name: 'مركز التقارير والتصدير', path: '/admin/dashboard/reports', icon: FileBarChart },
    { name: 'وارد صندوق الرسائل', path: '/admin/dashboard/messages', icon: Inbox },
  ];

  const isLinkActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 text-right font-cairo">
      
      {/* SIDEBAR - Desktop (Fixed) */}
      <aside className="hidden lg:flex flex-col w-64 bg-gov-dark text-white border-l-4 border-gov-gold shadow-lg shrink-0">
        {/* Admin Branding with Official Logo */}
        <div className="p-6 border-b border-white/5 bg-black/10 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg border border-gov-gold/30 shadow-sm shrink-0">
            <img src="/logo.jpg" alt="شعار مصلحة دمغ المصوغات والموازين" className="w-9 h-9 object-contain rounded-md" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-extrabold text-base text-white leading-tight">لوحة تحكم المكتب</span>
            <span className="text-[11px] text-gov-gold truncate" title={adminEmail}>{adminEmail}</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gov-primary text-gov-gold border-r-4 border-gov-gold shadow-inner'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-white/5 bg-black/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-300 hover:text-red-100 hover:bg-red-950/20 rounded-xl transition-all focus:outline-none"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* HEADER - Mobile Header & Desktop Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between lg:justify-end px-6 shadow-2xs relative z-30 no-print">
          
          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              بوابة التفتيش المغلقة الآمنة
            </span>
            <Link
              to="/"
              className="text-xs font-semibold text-gov-primary hover:text-gov-dark transition-all border border-gov-primary/20 hover:border-gov-primary px-3.5 py-1.5 rounded-lg"
            >
              الموقع العام للجمهور
            </Link>
          </div>

        </header>

        {/* SIDEBAR - Mobile (Drawer Overlay) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex no-print">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setSidebarOpen(false)}
            ></div>
            
            {/* Menu Drawer */}
            <aside className="relative flex flex-col w-64 bg-gov-dark text-white border-l-4 border-gov-gold shadow-2xl h-full animate-slide-in-right">
              <div className="p-6 border-b border-white/5 bg-black/10 flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg border border-gov-gold/30 shadow-sm shrink-0">
                  <img src="/logo.jpg" alt="شعار مصلحة دمغ المصوغات والموازين" className="w-9 h-9 object-contain rounded-md" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-extrabold text-base text-white leading-tight">لوحة تحكم المكتب</span>
                  <span className="text-[11px] text-gov-gold truncate">{adminEmail}</span>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-gov-primary text-gov-gold border-r-4 border-gov-gold shadow-inner'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5 bg-black/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-300 hover:text-red-100 hover:bg-red-950/20 rounded-xl transition-all focus:outline-none"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* WORKSPACE AREA - Renders nested admin sub-pages */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
