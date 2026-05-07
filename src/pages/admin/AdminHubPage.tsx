import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import { adminApi } from '../../api';
import { Spinner } from '../../components/common';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';
import type { DashboardStats } from '../../api/admin.api';

export const AdminHubPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>لوحة التحكم</h1>
          <p className="text-neutral-500">نظرة عامة على المنصة والإدارة</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-xl">
          <Shield className="w-5 h-5" style={{ color: '#DD643C' }} />
          <span className="font-medium" style={{ color: '#6B7B8C' }}>مدير النظام</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={stats?.totalUsers || 0}
          color="primary"
          link="/admin/users"
        />
        <StatCard
          icon={Package}
          label="البائعين النشطين"
          value={stats?.activeSellers || 0}
          color="nature"
          link="/admin/users"
        />
        <StatCard
          icon={ShoppingBag}
          label="طلبات اليوم"
          value={stats?.ordersToday || 0}
          color="warm"
          link="/admin/orders"
        />
        <StatCard
          icon={CreditCard}
          label="إيرادات اليوم"
          value={formatCurrency(stats?.revenueToday || 0)}
          color="heading"
          link="/admin/transactions"
        />
        <StatCard
          icon={CreditCard}
          label="المدفوعات المعلقة"
          value={stats?.pendingPayments || 0}
          color="primary"
          alert={stats?.pendingPayments ? 'تحتاج مراجعة' : undefined}
          link="/admin/transactions"
        />
        <StatCard
          icon={AlertTriangle}
          label="الشكاوى المفتوحة"
          value={stats?.openDisputes || 0}
          color="warm"
          link="/admin/orders"
        />
      </div>

      {/* Alerts Section */}
      {(stats?.pendingPayments || stats?.openDisputes) ? (
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)', border: '1px solid rgba(237, 142, 60, 0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" style={{ color: '#ED8E3C' }} />
            <h2 className="font-semibold" style={{ color: '#6B7B8C' }}>تتطلب إجراء</h2>
          </div>
          <div className="space-y-2">
            {stats?.pendingPayments > 0 && (
              <Link
                to="/admin/transactions"
                className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-surface-50 transition-colors"
              >
                <span style={{ color: '#6B7B8C' }}>
                  {stats.pendingPayments} دفعة في انتظار الموافقة
                </span>
                <ArrowUpRight className="w-4 h-4" style={{ color: '#DD643C' }} />
              </Link>
            )}
          </div>
        </div>
      ) : null}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLinkCard
          title="إدارة المستخدمين"
          description="إدارة المستخدمين، تعليق الحسابات، عرض النشاط"
          icon={Users}
          link="/admin/users"
          color="primary"
        />
        <QuickLinkCard
          title="مراقبة الخدمات"
          description="مراجعة الخدمات، تعطيل المحتوى غير الملائم"
          icon={Package}
          link="/admin/services"
          color="nature"
        />
        <QuickLinkCard
          title="إشراف الطلبات"
          description="مراقبة الطلبات، التعامل مع النزاعات، الإجراءات الإجبارية"
          icon={ShoppingBag}
          link="/admin/orders"
          color="heading"
        />
        <QuickLinkCard
          title="التحكم المالي"
          description="الموافقة على المدفوعات، عرض المعاملات، إدارة المدفوعات"
          icon={CreditCard}
          link="/admin/transactions"
          color="warm"
        />
        <QuickLinkCard
          title="الإعلانات"
          description="إرسال إشعارات على مستوى المنصة للمستخدمين"
          icon={TrendingUp}
          link="/admin/announcements"
          color="primary"
        />
      </div>
    </div>
  );
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color,
  alert,
  link
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  alert?: string;
  link: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-[#DD643C]',
    nature: 'bg-[#769E66]',
    warm: 'bg-[#ED8E3C]',
    heading: 'bg-[#6B7B8C]',
  };

  return (
    <Link to={link} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#6B7B8C' }}>{value}</p>
        </div>
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {alert && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#DD643C' }}>
          <AlertTriangle className="w-3 h-3" />
          {alert}
        </div>
      )}
    </Link>
  );
};

const QuickLinkCard = ({
  title,
  description,
  icon: Icon,
  link,
  color
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-[#DD643C]/10 text-[#DD643C]',
    nature: 'bg-[#769E66]/10 text-[#769E66]',
    warm: 'bg-[#ED8E3C]/10 text-[#ED8E3C]',
    heading: 'bg-[#6B7B8C]/10 text-[#6B7B8C]',
  };

  return (
    <Link to={link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold group-hover:text-primary transition-colors" style={{ color: '#6B7B8C' }}>
        {title}
      </h3>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </Link>
  );
};
