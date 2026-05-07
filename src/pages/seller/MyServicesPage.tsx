import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { sellerApi } from '../../api';
import { Spinner, EmptyState, ConfirmDialog } from '../../components/common';
import { formatCurrency, getImageUrl } from '../../utils';
import toast from 'react-hot-toast';
import type { SellerServiceItem } from '../../api/seller.api';

const statusLabels: Record<string, string> = {
  Active: 'نشط',
  Paused: 'موقوف',
  Draft: 'مسودة',
};

const statusColors: Record<string, string> = {
  Active: 'bg-surface-100 text-nature',
  Paused: 'bg-surface-100 text-warm',
  Draft: 'bg-surface-100 text-neutral',
};

export const MyServicesPage = () => {
  const [services, setServices] = useState<SellerServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<SellerServiceItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await sellerApi.getServices({});
      console.log('Seller services response:', res);
      if (res.success && res.data) {
        // Handle different response structures
        const data = res.data as any;
        const items = data.Items || data.items || data;
        setServices(Array.isArray(items) ? items : []);
      } else {
        console.error('Failed to load services:', res.message);
        toast.error(res.message || 'فشل تحميل الخدمات');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      toast.error('فشل تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleToggleStatus = async (service: SellerServiceItem) => {
    try {
      const res = await sellerApi.toggleServiceStatus(service.Id);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) =>
            s.Id === service.Id
              ? { ...s, Status: s.Status === 'Active' ? 'Paused' : 'Active' }
              : s
          )
        );
        toast.success(service.Status === 'Active' ? 'تم إيقاف الخدمة' : 'تم تفعيل الخدمة');
      }
    } catch {
      toast.error('فشل تحديث الحالة');
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    setDeletingId(serviceToDelete.Id);
    try {
      const res = await sellerApi.deleteService(serviceToDelete.Id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s.Id !== serviceToDelete.Id));
        toast.success('تم حذف الخدمة');
      }
    } catch {
      toast.error('فشل حذف الخدمة');
    } finally {
      setServiceToDelete(null);
      setDeletingId(null);
    }
  };

  const filtered = services.filter((s) =>
    s.Title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    total: services.length,
    active: services.filter((s) => s.Status === 'Active').length,
    paused: services.filter((s) => s.Status === 'Paused').length,
    draft: services.filter((s) => s.Status === 'Draft').length,
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900">خدماتي</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              className="pe-9 ps-4 py-2 border border-surface-200 rounded-xl text-sm outline-none focus:border-brand-500 w-52"
            />
          </div>
          <Link
            to="/seller/services/create"
            className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" /> إضافة خدمة
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'الكل', value: statusCounts.total, color: 'text-surface-900' },
          { label: 'نشط', value: statusCounts.active, color: 'text-emerald-600' },
          { label: 'موقوف', value: statusCounts.paused, color: 'text-amber-600' },
          { label: 'مسودة', value: statusCounts.draft, color: 'text-surface-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد خدمات بعد"
          message="أنشئ خدمتك الأولى وابدأ في البيع"
          actionLabel="إنشاء خدمة"
          onAction={() => window.location.href = '/seller/services/create'}
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الخدمة</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">السعر</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">التقييم</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((service, i) => (
                  <motion.tr
                    key={service.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0">
                          {service.Image ? (
                            <img src={getImageUrl(service.Image)} alt={service.Title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-surface-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-surface-900 text-sm truncate max-w-[180px]">{service.Title}</p>
                          <p className="text-xs text-neutral-500">{service.Category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-surface-900 text-sm">{formatCurrency(service.BasePrice)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[service.Status] || 'bg-surface-100 text-neutral-500'}`}>
                        {statusLabels[service.Status] || service.Status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-surface-700">
                          {(service.Rating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-surface-400">({service.OrdersCount} طلب)</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title={service.Status === 'Active' ? 'إيقاف' : 'تفعيل'}
                        >
                          {service.Status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link to={`/seller/services/${service.Id}/edit`}>
                          <button className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setServiceToDelete(service)}
                          className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={serviceToDelete !== null}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDelete}
        title="حذف الخدمة"
        message={`هل تريد حذف "${serviceToDelete?.Title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        isDangerous
        isLoading={deletingId !== null}
      />
    </div>
  );
};
