import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores';

const sidebarItems = [
  { path: '/seller/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, comingSoon: false },
  { path: '/seller/services', label: 'خدماتي', icon: Package, comingSoon: false },
  { path: '/seller/orders', label: 'إدارة الطلبات', icon: ShoppingBag, comingSoon: true },
  { path: '/seller/discounts', label: 'العروض والخصومات', icon: Tag, comingSoon: true },
  { path: '/seller/earnings', label: 'الأرباح', icon: DollarSign, comingSoon: true },
];

export const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ب';

  const handleLogout = () => {
    clearAuth();
    navigate('/signin');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <Link to="/seller/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-warm"
            style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
            م
          </div>
          <div>
            <p className="font-bold text-white text-lg">منزلي</p>
            <p className="text-xs text-white/50">وضع البائع</p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: 'rgba(221, 100, 60, 0.2)' } : {}}
            >
              {isActive && (
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                  style={{ backgroundColor: '#ED8E3C' }}
                />
              )}
              <item.icon
                className="w-5 h-5 flex-shrink-0"
                style={isActive ? { color: '#ED8E3C' } : {}}
              />
              <span className="flex-1">{item.label}</span>
              {item.comingSoon && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(237, 142, 60, 0.2)', color: '#ED8E3C' }}
                >
                  قريباً
                </span>
              )}
              {isActive && !item.comingSoon && (
                <ChevronLeft className="w-4 h-4" style={{ color: '#ED8E3C' }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: 'rgba(221, 100, 60, 0.3)', color: '#FDF4F0' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'بائع'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all w-full"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(221, 100, 60, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-surface-100">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — right side in RTL */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-60 flex-shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#6B7B8C' }}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30 flex items-center justify-between px-4 h-14">
          <Link to="/seller/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>م</div>
            <span className="font-bold text-surface-900">منزلي</span>
          </Link>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-surface-500 hover:text-surface-900 rounded-lg hover:bg-surface-100">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};