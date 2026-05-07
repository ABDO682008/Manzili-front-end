import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersApi } from '../../api';
import { Spinner, EmptyState } from '../../components/common';
import { formatCurrency, formatRelativeTime } from '../../utils';
import type { OrderItem } from '../../api/orders.api';

const statusColors: Record<string, string> = {
  Pending: 'bg-surface-100 text-heading-600 border border-surface-200',
  Accepted: 'bg-surface-100 text-nature-600 border border-surface-200',
  Rejected: 'bg-surface-100 text-primary border border-surface-200',
  Cancelled: 'bg-surface-100 text-neutral border border-surface-200',
  Paid: 'bg-surface-100 text-heading-600 border border-surface-200',
  InProgress: 'bg-surface-100 text-warm border border-surface-200',
  Completed: 'bg-surface-100 text-nature-600 border border-surface-200',
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

const orderTabs = [
  { id: 'all', label: 'الكل', status: undefined },
  { id: 'paid', label: 'مدفوع', status: 'Paid' },
  { id: 'inprogress', label: 'جاري التنفيذ', status: 'InProgress' },
  { id: 'completed', label: 'مكتمل', status: 'Completed' },
];

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const currentTab = orderTabs.find((t) => t.id === activeTab);
      const res = await ordersApi.getOrders({ status: currentTab?.status, page, pageSize: 20 });
      if (res.success && res.data) {
        const data = res.data as any;
        setOrders(data.items || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [activeTab]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">أوامري</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {orderTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'text-white'
                : 'bg-white text-surface-500 hover:bg-surface-50 border border-surface-200'
            }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <EmptyState type="orders" actionLabel="تصفّح الخدمات" onAction={() => navigate('/services')} />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-brand-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-semibold text-surface-900 text-sm truncate">{order.serviceName}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColors[order.status] || 'bg-surface-100 text-surface-500'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">{order.providerName}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-surface-900 text-sm">{formatCurrency(order.totalPrice)}</span>
                    <div className="flex items-center gap-1 text-xs text-surface-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <ChevronLeft className="w-4 h-4 text-surface-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-surface-200 rounded-xl text-sm disabled:opacity-40 hover:bg-surface-50">
                السابق
              </button>
              <span className="text-sm text-surface-500">صفحة {page} من {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border border-surface-200 rounded-xl text-sm disabled:opacity-40 hover:bg-surface-50">
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
