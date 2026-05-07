import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, EyeOff, AlertTriangle, Star } from 'lucide-react';
import { adminApi } from '../../api';
import { Spinner, EmptyState, Badge, Button, Modal } from '../../components/common';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';
import type { Service } from '../../types';

export const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getServices({
        search: searchQuery || undefined,
        page,
        pageSize: 20,
      });

      if (response.success && response.data) {
        setServices(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Error loading services:', err);
      toast.error('فشل تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggleStatus = async () => {
    if (!selectedService) return;

    setProcessing(true);
    try {
      const newStatus = selectedService.status === 'Active' ? 'Disabled' : 'Active';
      const response = await adminApi.updateServiceStatus(selectedService.id, newStatus as 'Active' | 'Disabled');
      if (response.success) {
        toast.success(`تم ${selectedService.status === 'Active' ? 'تعطيل' : 'تفعيل'} الخدمة`);
        fetchServices();
        setShowDisableModal(false);
        setSelectedService(null);
      }
    } catch {
      toast.error('فشل تنفيذ الإجراء');
    } finally {
      setProcessing(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>مراقبة الخدمات</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الخدمات..."
              className="pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد خدمات"
          message="جرب تعديل البحث"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الخدمة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">السعر</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">التقييم</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0">
                        {service.images?.[0] ? (
                          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">لا توجد صورة</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-1" style={{ color: '#6B7B8C' }}>{service.title}</p>
                        <p className="text-xs text-neutral-500">التصنيف: {service.categoryId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{service.sellerName}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: '#6B7B8C' }}>{formatCurrency(service.price)}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={service.status === 'Active' ? 'success' : service.status === 'Paused' ? 'warning' : 'gray'}
                    >
                      {service.status === 'Active' ? 'نشط' : service.status === 'Paused' ? 'موقوف' : 'مسودة'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" style={{ color: '#ED8E3C', fill: '#ED8E3C' }} />
                      <span className="text-sm">{service.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button
                      onClick={() => { setSelectedService(service); setShowDisableModal(true); }}
                      className="p-2 rounded-xl transition-colors"
                      style={service.status === 'Active'
                        ? { color: '#ED8E3C', backgroundColor: 'transparent' }
                        : { color: '#769E66', backgroundColor: 'transparent' }
                      }
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = service.status === 'Active' ? 'rgba(237, 142, 60, 0.1)' : 'rgba(118, 158, 102, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title={service.status === 'Active' ? 'تعطيل' : 'تفعيل'}
                    >
                      {service.status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors text-sm"
                style={{ color: '#6B7B8C' }}
              >
                السابق
              </button>
              <span className="text-sm text-neutral-500">
                صفحة {page} من {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors text-sm"
                style={{ color: '#6B7B8C' }}
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}

      {/* Disable/Enable Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => { setShowDisableModal(false); setSelectedService(null); }}
        title={selectedService?.status === 'Active' ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowDisableModal(false); setSelectedService(null); }}>
              إلغاء
            </Button>
            <Button
              variant={selectedService?.status === 'Active' ? 'danger' : 'primary'}
              onClick={handleToggleStatus}
              isLoading={processing}
            >
              {selectedService?.status === 'Active' ? 'تعطيل' : 'تفعيل'}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: selectedService?.status === 'Active' ? '#ED8E3C' : '#769E66' }} />
          <p className="text-neutral-500">
            {selectedService?.status === 'Active'
              ? `تعطيل "${selectedService?.title}"؟ لن تكون مرئية للمشترين بعد الآن.`
              : `تفعيل "${selectedService?.title}"؟ ستصبح مرئية للمشترين مرة أخرى.`
            }
          </p>
        </div>
      </Modal>
    </div>
  );
};
