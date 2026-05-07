import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Wallet, ArrowDownToLine, Clock, CheckCircle } from 'lucide-react';
import { Spinner, EmptyState, Badge, Button } from '../../components/common';
import { formatCurrency, formatDate } from '../../utils';
import toast from 'react-hot-toast';

interface EarningStats {
  totalEarnings: number;
  availableBalance: number;
  pendingClearance: number;
  lifetimeSales: number;
  totalOrders: number;
  thisMonth: number;
}

interface Transaction {
  id: number;
  orderId: number;
  amount: number;
  type: 'Sale' | 'Payout' | 'Refund' | 'Fee';
  status: 'Completed' | 'Pending' | 'Processing';
  date: string;
  description: string;
}

export const SellerEarningsPage = () => {
  const [stats, setStats] = useState<EarningStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'payouts'>('all');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setStats({
        totalEarnings: 45600,
        availableBalance: 12800,
        pendingClearance: 5400,
        lifetimeSales: 52300,
        totalOrders: 156,
        thisMonth: 8900,
      });

      setTransactions([
        { id: 1, orderId: 1001, amount: 1500, type: 'Sale', status: 'Completed', date: new Date().toISOString(), description: 'Order #1001 - Custom Cake' },
        { id: 2, orderId: 1002, amount: 2500, type: 'Sale', status: 'Completed', date: new Date(Date.now() - 86400000).toISOString(), description: 'Order #1002 - Handmade Vase' },
        { id: 3, orderId: 0, amount: -5000, type: 'Payout', status: 'Completed', date: new Date(Date.now() - 3 * 86400000).toISOString(), description: 'Bank Transfer - Weekly Payout' },
        { id: 4, orderId: 1003, amount: 800, type: 'Sale', status: 'Pending', date: new Date(Date.now() - 2 * 86400000).toISOString(), description: 'Order #1003 - Flower Bouquet' },
        { id: 5, orderId: 1004, amount: 1200, type: 'Sale', status: 'Pending', date: new Date(Date.now() - 4 * 86400000).toISOString(), description: 'Order #1004 - Birthday Package' },
        { id: 6, orderId: 995, amount: -200, type: 'Refund', status: 'Completed', date: new Date(Date.now() - 10 * 86400000).toISOString(), description: 'Order #995 - Partial Refund' },
      ]);
    } catch {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = () => {
    if (!stats || stats.availableBalance < 100) {
      toast.error('Minimum payout amount is EGP 100');
      return;
    }
    toast.success('Payout request submitted');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'Processing':
        return <Badge variant="info">Processing</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Sale':
        return <DollarSign className="w-4 h-4" style={{ color: '#769E66' }} />;
      case 'Payout':
        return <ArrowDownToLine className="w-4 h-4" style={{ color: '#6B7B8C' }} />;
      case 'Refund':
        return <DollarSign className="w-4 h-4" style={{ color: '#DD643C' }} />;
      default:
        return <DollarSign className="w-4 h-4" style={{ color: '#9BA8B4' }} />;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sales') return t.type === 'Sale';
    if (activeTab === 'payouts') return t.type === 'Payout';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>الأرباح</h1>
          <p className="mt-1" style={{ color: '#9BA8B4' }}>تتبع مبيعاتك ومدفوعاتك</p>
        </div>

        <Button onClick={handleRequestPayout}>
          <Wallet className="w-4 h-4 ml-2" />
          طلب سحب
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#769E66' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.totalEarnings || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي الأرباح</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
              <Wallet className="w-5 h-5" style={{ color: '#6B7B8C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.availableBalance || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>الرصيد المتاح</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)' }}>
              <Clock className="w-5 h-5" style={{ color: '#ED8E3C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.pendingClearance || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>في انتظار التصفية</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#DD643C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.thisMonth || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>هذا الشهر</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#769E66' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{stats?.totalOrders || 0}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي الطلبات</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(155, 168, 180, 0.1)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#9BA8B4' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{formatCurrency(stats?.lifetimeSales || 0)}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي المبيعات</p>
        </div>
      </div>

      {/* Payout Info Banner */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)', border: '1px solid rgba(107, 123, 140, 0.2)' }}>
        <Wallet className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#6B7B8C' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#6B7B8C' }}>معلومات السحب</p>
          <p className="text-sm mt-1" style={{ color: '#9BA8B4' }}>
            يمكنك سحب رصيدك المتاح لحسابك البنكي. الحد الأدنى للسحب هو ١٠٠ جنيه.
            تتم معالجة المدفوعات كل يوم ثلاثاء وجمعة.
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: '#6B7B8C' }}>سجل المعاملات</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#DD643C] text-white'
                  : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'bg-[#DD643C] text-white'
                  : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
              }`}
            >
              المبيعات
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'payouts'
                  ? 'bg-[#DD643C] text-white'
                  : 'bg-surface-100 text-heading-600 hover:bg-surface-200'
              }`}
            >
              المدفوعات
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                type="default"
                title="لا توجد معاملات"
                message="ستظهر المعاملات هنا عند إجراء مبيعات أو طلب مدفوعات"
              />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">المعاملة</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-100 rounded-xl">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#6B7B8C' }}>{transaction.type}</p>
                          <p className="text-sm" style={{ color: '#9BA8B4' }}>{transaction.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: transaction.amount >= 0 ? '#769E66' : '#DD643C' }}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#9BA8B4' }}>
                      {formatDate(transaction.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
