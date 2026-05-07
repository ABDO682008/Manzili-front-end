import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CreditCard, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersApi } from '../../api';
import { Spinner, EmptyState } from '../../components/common';
import { formatCurrency, formatRelativeTime } from '../../utils';
import type { OrderItem } from '../../api/orders.api';

const statusColors: Record<string, string> = {
  Pending: 'bg-surface-100 text-warm border border-surface-200',
  Accepted: 'bg-surface-100 text-nature border border-surface-200',
  Rejected: 'bg-surface-100 text-primary border border-surface-200',
  Cancelled: 'bg-surface-100 text-neutral border border-surface-200',
  Paid: 'bg-surface-100 text-heading border border-surface-200',
  InProgress: 'bg-surface-100 text-heading border border-surface-200',
  Completed: 'bg-surface-100 text-nature border border-surface-200',
};

const statusLabels: Record<string, string> = {
  Pending: 'في الانتظار',
  Accepted: 'مقبول',
  Rejected: 'مرفوض',
  Cancelled: 'ملغي',
  Paid: 'مدفوع',
  InProgress: 'جاري التنفيذ',
  Completed: 'مكتمل',
};

const statusTabs = [
  { id: 'pending', label: 'في الانتظار', status: 'Pending' },
  { id: 'accepted', label: 'جاهز للدفع', status: 'Accepted' },
  { id: 'paid', label: 'مدفوع', status: 'Paid' },
  { id: 'rejected', label: 'مرفوض', status: 'Rejected' },
];

export const RequestsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const currentTab = statusTabs.find((t) => t.id === activeTab);
      const res = await ordersApi.getOrders({ status: currentTab?.status, pageSize: 50 });
      if (res.success && res.data) {
        setOrders((res.data as any).items || []);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">طلباتي</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'text-white shadow-sm'
                : 'bg-white text-neutral-500 hover:bg-surface-50 border border-surface-200'
            }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState type="requests" actionLabel="تصفّح الخدمات" onAction={() => navigate('/services')} />
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 md:p-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
                  <Package className="w-6 h-6" style={{ color: '#DD643C' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-surface-900 text-sm">{order.serviceName}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{order.providerName}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-surface-100 text-neutral-500'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="font-bold text-surface-900">{formatCurrency(order.totalPrice)}</span>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {order.customizationDetails && (
                    <p className="mt-2 text-xs text-neutral-500 line-clamp-2 italic">"{order.customizationDetails}"</p>
                  )}

                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => navigate('/payment/summary')}
                      className="mt-3 flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
                    >
                      <CreditCard className="w-4 h-4" />
                      ادفع الآن
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
