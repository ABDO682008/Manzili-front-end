import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard,
  Megaphone,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore, useNotificationStore } from '../../stores';

const sidebarItems = [
  { path: '/admin/hub', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/users', label: 'المستخدمين', icon: Users },
  { path: '/admin/services', label: 'الخدمات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/transactions', label: 'المعاملات', icon: CreditCard },
  { path: '/admin/announcements', label: 'الإعلانات', icon: Megaphone },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    clearAuth();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-heading-700 shadow-soft sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-surface-200 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/admin/hub" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
              <span className="text-white font-bold text-sm">م</span>
            </div>
            <span className="font-bold text-lg text-white">منزلي</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-surface-200 hover:text-white hover:bg-white/10 rounded-full"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center" style={{ background: '#DD643C' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - narrower w-64 (16rem) instead of w-72 (18rem) */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 text-white
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ background: '#6B7B8C' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link to="/admin/hub" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <span className="font-bold text-xl">منزلي</span>
                <span className="block text-xs text-white/70 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  لوحة الإدارة
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'text-white shadow-soft'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'}
                  `}
                  style={isActive ? { background: '#DD643C' } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                {user?.fullName?.charAt(0) || 'م'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || 'المدير'}</p>
                <p className="text-xs text-white/50 truncate">مدير النظام</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - adjusted margin for narrower sidebar */}
      <main className="lg:mr-64 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white shadow-soft">
          <h1 className="text-xl font-bold" style={{ color: '#6B7B8C' }}>
            {sidebarItems.find(item => location.pathname.startsWith(item.path))?.label || 'الرئيسية'}
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-neutral-500 hover:text-heading-700 hover:bg-surface-50 rounded-full"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center" style={{ background: '#DD643C' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 p-2 pl-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                {user?.fullName?.charAt(0) || 'م'}
              </div>
              <span className="text-sm font-medium" style={{ color: '#6B7B8C' }}>{user?.fullName?.split(' ')[0] || 'المدير'}</span>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
