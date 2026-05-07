import { User, Mail, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores';

const roleLabels: Record<string, string> = {
  Buyer: 'مشتري',
  Seller: 'بائع',
  Admin: 'مدير',
  DeliveryAgent: 'موصّل',
};

export const AccountPage = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

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

  const menuItems = [
    { icon: User, label: 'الملف الشخصي', desc: 'عرض وتعديل بياناتك', path: '/profile' },
    { icon: Shield, label: 'الأمان', desc: 'كلمة المرور وأمان الحساب', path: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-3xl p-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          {initials}
        </div>
        <h2 className="text-xl font-bold text-heading-700">{user?.fullName || 'مستخدم'}</h2>
        <p className="text-neutral-500 text-sm mt-0.5 flex items-center justify-center gap-1">
          <Mail className="w-3.5 h-3.5" /> {user?.email}
        </p>
        <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary">
          {roleLabels[user?.uiRole || ''] || user?.uiRole}
        </span>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)' }}>
        {menuItems.map((item, i) => (
          <div key={item.label}>
            {i > 0 && <div className="border-t border-surface-100 mx-4" />}
            {item.path ? (
              <Link
                to={item.path}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900">{item.label}</p>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-surface-400" />
              </Link>
            ) : (
              <div className="flex items-center gap-4 px-5 py-4 opacity-50 cursor-not-allowed">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-neutral-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900">{item.label}</p>
                  <p className="text-xs text-neutral-500">{item.desc} · قريباً</p>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="border-t border-surface-100 mx-4" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 hover:bg-primary-50 transition-colors w-full text-right group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-primary-100" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
            <LogOut className="w-5 h-5" style={{ color: '#DD643C' }} />
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: '#DD643C' }}>تسجيل الخروج</p>
            <p className="text-xs text-neutral-500">الخروج من حسابك</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
};
