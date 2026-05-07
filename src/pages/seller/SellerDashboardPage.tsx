import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, Star, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { sellerApi } from '../../api';
import { Spinner } from '../../components/common';
import { formatCurrency } from '../../utils';
import { useAuthStore } from '../../stores';
import type { SellerDashboardStats } from '../../api/seller.api';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

export const SellerDashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.getDashboard()
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
        else setStats({ totalServices: 0, activeOrders: 0, completedOrders: 0, totalRevenue: 0, averageRating: 0 });
      })
      .catch(() => {
        setStats({ totalServices: 0, activeOrders: 0, completedOrders: 0, totalRevenue: 0, averageRating: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>
  );

  const kpiCards = [
    { icon: Package, label: 'إجمالي الخدمات', value: stats?.totalServices ?? 0, color: 'heading', link: '/seller/services' },
    { icon: ShoppingBag, label: 'الطلبات النشطة', value: stats?.activeOrders ?? 0, color: 'warm', link: '/seller/orders' },
    { icon: TrendingUp, label: 'مكتملة', value: stats?.completedOrders ?? 0, color: 'nature', link: '/seller/orders' },
    { icon: DollarSign, label: 'الإيرادات', value: formatCurrency(stats?.totalRevenue ?? 0), color: 'primary', link: '/seller/earnings' },
    { icon: Star, label: 'متوسط التقييم', value: (stats?.averageRating ?? 0).toFixed(1), color: 'warm', link: '/seller/services' },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    heading: { bg: 'bg-heading-50', text: 'text-heading-600', icon: 'text-heading-500' },
    warm: { bg: 'bg-warm-50', text: 'text-warm', icon: 'text-warm' },
    nature: { bg: 'bg-nature-50', text: 'text-nature-600', icon: 'text-nature-500' },
    primary: { bg: 'bg-primary-50', text: 'text-primary', icon: 'text-primary' },
  };

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            أهلاً بعودتك، {user?.fullName?.split(' ')[0] || 'بائع'} 👋
          </h1>
          <p className="text-surface-500 text-sm mt-1">إليك نظرة عامة على نشاطك التجاري</p>
        </div>
        <Link
          to="/seller/services/create"
          className="flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          <Plus className="w-4 h-4" /> إضافة خدمة
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const colors = colorMap[card.color];
          return (
            <motion.div
              key={card.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-xs text-surface-500 mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/seller/services/create', label: 'إنشاء خدمة جديدة', desc: 'أضف خدمة جديدة للمشترين', icon: Plus },
            { to: '/seller/services', label: 'إدارة الخدمات', desc: 'عرض وتحديث إعلاناتك', icon: Package },
            { to: '/seller/orders', label: 'إدارة الطلبات', desc: 'تعامل مع الطلبات الواردة', icon: ShoppingBag },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-2xl p-5 hover:shadow-md transition-all group"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                <action.icon className="w-5 h-5 text-brand-600" />
              </div>
              <p className="font-semibold text-surface-900 text-sm">{action.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {stats?.totalServices === 0 && (
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="bg-brand-50 border border-brand-200 rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-7 h-7 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-brand-900">ابدأ الآن</h3>
            <p className="text-sm text-brand-700 mt-1">أنشئ خدمتك الأولى وابدأ في تلقّي الطلبات من المشترين.</p>
          </div>
          <Link
            to="/seller/services/create"
            className="px-4 py-2 text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
          >
            إنشاء خدمة
          </Link>
        </motion.div>
      )}
    </div>
  );
};
