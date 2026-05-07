import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Truck, 
  Package, 
  ClipboardList, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../stores';
import { Avatar } from '../common';

const navItems = [
  { path: '/delivery', label: 'تتبع الطلب', icon: Truck },
  { path: '/delivery/available', label: 'متاح', icon: Package },
  { path: '/delivery/my-deliveries', label: 'توصيلاتي', icon: ClipboardList },
];

export const DeliveryLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

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
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/delivery" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                <span className="text-white font-bold text-lg">م</span>
              </div>
              <div>
                <span className="font-bold text-xl" style={{ color: '#6B7B8C' }}>منزلي</span>
                <span className="block text-xs" style={{ color: '#9BA8B4' }}>بوابة التوصيل</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'bg-heading-100 text-heading-600'
                      : 'text-neutral hover:bg-surface-100 hover:text-heading-600'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-neutral hover:text-heading-600 hover:bg-surface-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: '#DD643C' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-surface-100 transition-colors"
              >
                <Avatar src={user?.avatarUrl} size="sm" />
                <span className="hidden sm:inline text-sm font-medium" style={{ color: '#6B7B8C' }}>
                  {user?.firstName}
                </span>
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 text-neutral hover:text-primary hover:bg-primary-50 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center justify-around border-t border-surface-100 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'text-heading-600'
                  : 'text-neutral'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};
