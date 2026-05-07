import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Package,
  User,
  DollarSign,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle,
  Hash,
  Shield,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Settings,
  Eye,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { servicesApi, type ServiceDetail } from '../../api/services.api';
import { adminApi } from '../../api/admin.api';

export const AdminServiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const serviceId = parseInt(id || '0', 10);

  const [expandedSections, setExpandedSections] = useState({
    details: true,
    options: true,
    images: true,
  });

  const { data: serviceResponse, isLoading } = useQuery({
    queryKey: ['admin-service', serviceId],
    queryFn: () => servicesApi.getServiceById(serviceId),
    enabled: !!serviceId,
  });

  const service = serviceResponse?.data;

  const blockMutation = useMutation({
    mutationFn: () => adminApi.updateServiceStatus(serviceId, 'Disabled'),
    onSuccess: () => {
      toast.success('تم حظر الخدمة');
      queryClient.invalidateQueries({ queryKey: ['admin-service', serviceId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-heading-500">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#DD643C' }} />
          <p className="text-heading-600 font-semibold mb-2">لم يتم العثور على الخدمة</p>
          <button onClick={() => navigate('/admin/services')} className="btn-primary mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للخدمات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Admin Badge */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full w-fit" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)' }}>
        <Shield className="w-4 h-4" style={{ color: '#6B7B8C' }} />
        <span className="text-sm font-medium" style={{ color: '#6B7B8C' }}>وضع المشرف</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate('/admin/services')}
          className="p-2 rounded-xl hover:bg-surface-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-heading-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-heading-700">تفاصيل الخدمة</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
            <Hash className="w-4 h-4" />
            خدمة #{service.id}
          </p>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-4 mb-6 border ${getStatusColor(service.status)}`}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5" />
          <div>
            <p className="font-semibold">
              {service.status === 'Active' ? 'نشط' : service.status === 'Draft' ? 'مسودة' : 'محظور'}
            </p>
            <p className="text-sm opacity-80">
              {service.status === 'Active' ? 'الخدمة متاحة للطلب' : 'الخدمة غير متاحة'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Admin Actions */}
      <div className="card-warm p-6 mb-6 border-2" style={{ borderColor: 'rgba(107, 123, 140, 0.2)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" style={{ color: '#6B7B8C' }} />
          <h2 className="text-lg font-bold text-heading-700">إجراءات الإدارة</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toggleStatusMutation.mutate()}
            disabled={toggleStatusMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
            style={service.status === 'Active' 
              ? { backgroundColor: 'rgba(237, 142, 60, 0.1)', color: '#ED8E3C' }
              : { backgroundColor: 'rgba(118, 158, 102, 0.1)', color: '#769E66' }
            }
          >
            {toggleStatusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : service.status === 'Active' ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {service.status === 'Active' ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
          </button>

          <button
            onClick={() => navigate(`/seller/services/${service.id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)', color: '#6B7B8C' }}
          >
            <Eye className="w-4 h-4" />
            عرض كبائع
          </button>

          <button
            onClick={() => navigate(`/admin/users/${service.providerId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-200 text-heading-700 rounded-xl hover:bg-surface-300 transition-colors"
          >
            <User className="w-4 h-4" />
            صفحة البائع
          </button>
        </div>
      </div>

      {/* Service Info Card */}
      <div className="card-warm p-6 mb-4">
        <button
          onClick={() => toggleSection('details')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-heading-700">معلومات الخدمة</h2>
          </div>
          {expandedSections.details ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {expandedSections.details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-bold text-xl text-heading-700 mb-2">{service.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{service.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-200">
                <div className="p-4 bg-surface-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-neutral-500">السعر الأساسي</p>
                  <p className="font-bold text-heading-700">{service.basePrice} ج.م</p>
                </div>

                <div className="p-4 bg-surface-50 rounded-xl">
                  <Tag className="w-5 h-5 text-nature mb-2" />
                  <p className="text-sm text-neutral-500">التصنيف</p>
                  <p className="font-bold text-heading-700">{service.category}</p>
                </div>

                <div className="p-4 bg-surface-50 rounded-xl">
                  <Star className="w-5 h-5 text-warm mb-2" />
                  <p className="text-sm text-neutral-500">التقييم</p>
                  <p className="font-bold text-heading-700">{service.rating || 'لا يوجد'}</p>
                </div>

                <div className="p-4 bg-surface-50 rounded-xl">
                  <Package className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm text-neutral-500">عدد الطلبات</p>
                  <p className="font-bold text-heading-700">{service.ordersCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 mb-1">البائع</p>
                  <p className="font-semibold text-heading-700">{service.providerName}</p>
                  <p className="text-sm text-neutral-400">ID: {service.providerId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 mb-1">تاريخ الإنشاء</p>
                  <p className="font-semibold text-heading-700">
                    {format(new Date(service.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {formatDistanceToNow(new Date(service.createdAt), { addSuffix: true, locale: ar })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Option Groups */}
      {service.optionGroups && service.optionGroups.length > 0 && (
        <div className="card-warm p-6 mb-4">
          <button
            onClick={() => toggleSection('options')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-nature" />
              <h2 className="text-lg font-bold text-heading-700">خيارات الخدمة</h2>
            </div>
            {expandedSections.options ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {expandedSections.options && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {service.optionGroups.map((group) => (
                  <div key={group.id} className="p-4 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-heading-700">{group.name}</h3>
                      {group.isRequired && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          مطلوب
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                        >
                          <span className="text-neutral-700">{option.name}</span>
                          <span className="font-medium text-primary">
                            +{option.price} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Images */}
      {service.images && service.images.length > 0 && (
        <div className="card-warm p-6 mb-4">
          <button
            onClick={() => toggleSection('images')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-warm" />
              <h2 className="text-lg font-bold text-heading-700">صور الخدمة</h2>
            </div>
            {expandedSections.images ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {expandedSections.images && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {service.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-surface-200 overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Block Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600">حظر الخدمة</h3>
                  <p className="text-sm text-neutral-500">إجراء إداري</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                سيتم حظر هذه الخدمة وإخفاؤها عن المستخدمين. هذا الإجراء يمكن التراجع عنه لاحقاً.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب الحظر <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب حظر هذه الخدمة..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBlockModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!blockReason.trim()) {
                        toast.error('يرجى إدخال سبب الحظر');
                        return;
                      }
                      blockMutation.mutate();
                    }}
                    disabled={blockMutation.isPending}
                    className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {blockMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'حظر الخدمة'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServiceDetailsPage;
