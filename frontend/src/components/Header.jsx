import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, FileText, Search, Phone, LogOut, Menu, X, LayoutDashboard, Download, BookOpen, HeartHandshake } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('adminToken');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: Shield },
    { name: 'تقديم طلب جديد', path: '/new-request', icon: FileText },
    { name: 'الاستعلام عن طلب', path: '/track', icon: Search },
    { name: 'تحميل النماذج', path: '/download-forms', icon: Download },
    { name: 'المواصفات الفنية', path: '/technical-standards', icon: BookOpen },
    { name: 'التوعية', path: '/awareness', icon: HeartHandshake },
    { name: 'اتصل بنا', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gov-dark text-white border-b-4 border-gov-gold shadow-md relative z-50 select-none">
      {/* Top Bar - Official Text */}
      <div className="bg-black/20 text-xs py-1.5 px-4 text-center border-b border-white/5 font-light tracking-wide text-gray-300">
         • وزارة التموين والتجارة الداخلية • مصلحة دمغ المصوغات والموازين
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Logo & Office Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="bg-white p-1 rounded-xl border border-gov-gold/30 shadow-md group-hover:scale-105 transition-all duration-300">
              <img
                src="/logo.jpg"
                alt="شعار مصلحة دمغ المصوغات والموازين"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col text-right">
              <span className="font-bold text-base sm:text-lg leading-tight text-white group-hover:text-gov-gold transition-colors duration-200">
                مكتب موازين العبور
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 focus:outline-none ${
                    isActive(link.path)
                      ? 'bg-gov-primary text-gov-gold border-b-2 border-gov-gold shadow-inner'
                      : 'hover:bg-white/5 text-gray-200 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Medium screen Navigation Links */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {navLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 focus:outline-none ${
                    isActive(link.path)
                      ? 'bg-gov-primary text-gov-gold shadow-inner'
                      : 'hover:bg-white/5 text-gray-200 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none border border-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-gov-dark border-t border-white/10 px-4 pt-2 pb-6 space-y-2 animate-fade-in shadow-xl relative z-40">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-gov-primary text-gov-gold border-r-4 border-gov-gold'
                    : 'text-gray-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
