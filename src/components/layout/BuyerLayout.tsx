import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ClipboardList, Package, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores';

const navItems = [
  { path: '/home', label: 'الرئيسية', icon: Home },
  { path: '/services', label: 'الخدمات', icon: Search },
  { path: '/requests', label: 'طلباتي', icon: ClipboardList },
  { path: '/orders', label: 'أوامري', icon: Package },
  { path: '/favorites', label: 'المفضلة', icon: Heart },
];

export const BuyerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'م';

  const handleLogout = () => {
    clearAuth();
    navigate('/signin');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Desktop Header */}
      <header className="hidden md:block bg-white/80 backdrop-blur-md border-b border-surface-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-warm"
                style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                م
              </div>
              <span className="font-bold text-xl text-surface-900">منزلي</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                  {initials}
                </div>
                <span className="text-sm font-medium text-surface-700">{user?.fullName?.split(' ')[0] || 'مستخدم'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-surface-400 hover:text-primary rounded-xl transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-surface-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>م</div>
            <span className="font-bold text-lg text-surface-900">منزلي</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-surface-500 hover:bg-surface-100 rounded-xl transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-surface-100 px-4 py-3 space-y-1 bg-white">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'bg-primary-50 text-primary' : 'text-surface-500 hover:bg-surface-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <hr className="border-surface-100 my-1" />
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-50">
              <User className="w-5 h-5" /> حسابي
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary-50 w-full">
              <LogOut className="w-5 h-5" /> تسجيل الخروج
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-surface-100 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive(item.path) ? 'text-primary' : 'text-surface-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
