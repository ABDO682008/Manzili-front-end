import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Package } from 'lucide-react';
import { Spinner, EmptyState, Badge } from '../../components/common';
import { formatCurrency, formatDateTime } from '../../utils';
import type { Transaction } from '../../types';

export const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Use mock data since we don't have admin-specific order endpoints
      const mockOrders: Transaction[] = [
        {
          id: 1001,
          type: 'Request',
          status: 'Request',
          serviceId: 1,
          serviceTitle: 'Custom Cake',
          sellerId: 10,
          sellerName: 'Bakery Delight',
          buyerId: 5,
          buyerName: 'Ahmed Hassan',
          originalPrice: 1500,
          finalPrice: 1500,
          quantity: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 1002,
          type: 'Accepted',
          status: 'InProgress',
          serviceId: 2,
          serviceTitle: 'Handmade Vase',
          sellerId: 11,
          sellerName: 'Handmade Crafts',
          buyerId: 6,
          buyerName: 'Sara Ali',
          originalPrice: 2500,
          finalPrice: 2500,
          quantity: 1,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 1003,
          type: 'Completed',
          status: 'Delivered',
          serviceId: 3,
          serviceTitle: 'Flower Bouquet',
          sellerId: 12,
          sellerName: 'Fresh Flowers',
          buyerId: 7,
          buyerName: 'Mohamed Omar',
          originalPrice: 800,
          finalPrice: 800,
          quantity: 1,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      
      let filteredOrders = mockOrders;
      if (searchQuery) {
        filteredOrders = filteredOrders.filter(o => 
          o.id.toString().includes(searchQuery)
        );
      }
      if (statusFilter) {
        filteredOrders = filteredOrders.filter(o => o.status === statusFilter);
      }
      setOrders(filteredOrders);
      setTotalPages(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger' | 'gray'; label: string }> = {
      'PendingSellerConfirmation': { variant: 'warning', label: 'في انتظار التأكيد' },
      'PriceGiven': { variant: 'info', label: 'تم تحديد السعر' },
      'InProgress': { variant: 'info', label: 'قيد التنفيذ' },
      'ReadyForDelivery': { variant: 'warning', label: 'جاهز للتوصيل' },
      'OutForDelivery': { variant: 'info', label: 'جاري التوصيل' },
      'Delivered': { variant: 'success', label: 'تم التوصيل' },
      'Cancelled': { variant: 'danger', label: 'ملغي' },
    };
    const config = statusMap[status] || { variant: 'gray', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const orderStatuses = [
    { value: 'PendingSellerConfirmation', label: 'في انتظار التأكيد' },
    { value: 'PriceGiven', label: 'تم تحديد السعر' },
    { value: 'InProgress', label: 'قيد التنفيذ' },
    { value: 'ReadyForDelivery', label: 'جاهز للتوصيل' },
    { value: 'OutForDelivery', label: 'جاري التوصيل' },
    { value: 'Delivered', label: 'تم التوصيل' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'CancelledByBuyer', label: 'ملغي من المشتري' },
    { value: 'CancelledBySeller', label: 'ملغي من البائع' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>إدارة الطلبات</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9BA8B4' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الطلبات..."
              className="pr-10 pl-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="">كل الحالات</option>
            {orderStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>156</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي الطلبات</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#ED8E3C' }}>23</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>في الانتظار</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>45</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>قيد التنفيذ</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#769E66' }}>88</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>مكتملة</p>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد طلبات"
          message="جرب تعديل البحث أو الفلاتر"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">المشتري</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">التاريخ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: '#6B7B8C' }} />
                      <span className="font-medium" style={{ color: '#6B7B8C' }}>#{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#6B7B8C' }}>{order.buyerName}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#6B7B8C' }}>{order.sellerName}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: '#DD643C' }}>{formatCurrency(order.finalPrice)}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#9BA8B4' }}>{formatDateTime(order.createdAt)}</td>
                  <td className="px-6 py-4 text-left">
                    <button
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
                      style={{ color: '#6B7B8C' }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors"
                style={{ color: '#6B7B8C' }}
              >
                السابق
              </button>
              <span className="text-sm" style={{ color: '#9BA8B4' }}>
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors"
                style={{ color: '#6B7B8C' }}
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
