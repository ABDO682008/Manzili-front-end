import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  User,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Hash,
  Shield,
  Ban,
  FastForward,
  Building2,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionsApi } from '../../api/transactions.api';
import { adminApi } from '../../api/admin.api';
import { STATUS_LABELS } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Request: 'bg-surface-100 text-heading border-surface-200',
    RePriced: 'bg-surface-100 text-warm border-surface-200',
    Accepted: 'bg-surface-100 text-nature border-surface-200',
    AcceptedPrice: 'bg-surface-100 text-nature border-surface-200',
    Paid: 'bg-surface-100 text-nature border-surface-200',
    InProgress: 'bg-surface-100 text-heading border-surface-200',
    ReadyForShipping: 'bg-surface-100 text-heading border-surface-200',
    OutForDelivery: 'bg-surface-100 text-primary border-surface-200',
    Delivered: 'bg-surface-100 text-nature border-surface-200',
    Completed: 'bg-surface-100 text-nature border-surface-200',
    CancelledByBuyer: 'bg-surface-100 text-primary border-surface-200',
    CancelledBySeller: 'bg-surface-100 text-primary border-surface-200',
    Rejected: 'bg-surface-100 text-primary border-surface-200',
    Expired: 'bg-surface-100 text-neutral border-surface-200',
  };
  return colors[status] || 'bg-surface-100 text-neutral';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Request':
      return <Clock className="w-4 h-4" />;
    case 'Accepted':
    case 'AcceptedPrice':
      return <CheckCircle className="w-4 h-4" />;
    case 'Paid':
      return <DollarSign className="w-4 h-4" />;
    case 'InProgress':
      return <Building2 className="w-4 h-4" />;
    case 'ReadyForShipping':
      return <Package className="w-4 h-4" />;
    case 'OutForDelivery':
      return <MapPin className="w-4 h-4" />;
    case 'Delivered':
    case 'Completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'CancelledByBuyer':
    case 'CancelledBySeller':
    case 'Rejected':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export const AdminOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderId = parseInt(id || '0', 10);

  const [showForceCancelModal, setShowForceCancelModal] = useState(false);
  const [showForceCompleteModal, setShowForceCompleteModal] = useState(false);
  const [forceCancelReason, setForceCancelReason] = useState('');
  const [forceCompleteReason, setForceCompleteReason] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    parties: true,
    timeline: true,
  });

  const { data: orderResponse, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => transactionsApi.getTransactionById(orderId),
    enabled: !!orderId,
  });

  const order = orderResponse?.data;

  // Admin mutations
  const forceCancelMutation = useMutation({
    mutationFn: (reason: string) => adminApi.forceCancelOrder(orderId, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب إجبارياً');
      setShowForceCancelModal(false);
      setForceCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const forceCompleteMutation = useMutation({
    mutationFn: (reason: string) => adminApi.forceCompleteOrder(orderId, reason),
    onSuccess: () => {
      toast.success('تم إكمال الطلب إجبارياً');
      setShowForceCompleteModal(false);
      setForceCompleteReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
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
          <p className="text-heading-500">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#DD643C' }} />
          <p className="text-heading-600 font-semibold mb-2">لم يتم العثور على الطلب</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn-primary mt-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  const canForceCancel = ['Request', 'Accepted', 'AcceptedPrice', 'Paid', 'InProgress', 'ReadyForShipping', 'OutForDelivery', 'Delivered'].includes(order.status);
  const canForceComplete = ['Paid', 'InProgress', 'ReadyForShipping', 'OutForDelivery', 'Delivered'].includes(order.status);

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
          onClick={() => navigate('/admin/orders')}
          className="p-2 rounded-xl hover:bg-surface-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-heading-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-heading-700">تفاصيل الطلب (إداري)</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
            <Hash className="w-4 h-4" />
            طلب #{order.id}
          </p>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-4 mb-6 border ${getStatusColor(order.status)}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <p className="font-semibold">{STATUS_LABELS[order.status]?.ar || order.status}</p>
            <p className="text-sm opacity-80">
              {order.status === 'Completed'
                ? 'الطلب مكتمل'
                : order.status.includes('Cancel') || order.status === 'Rejected'
                ? 'الطلب ملغى/مرفوض'
                : 'الطلب قيد المعالجة'}
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
        <p className="text-sm text-neutral-600 mb-4">
          هذه الإجراءات تؤثر مباشرة على حالة الطلب ويجب استخدامها بحذر.
        </p>
        <div className="flex flex-wrap gap-3">
          {canForceCancel && (
            <button
              onClick={() => setShowForceCancelModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)', color: '#DD643C' }}
            >
              <Ban className="w-4 h-4" />
              إلغاء إجباري
            </button>
          )}
          {canForceComplete && (
            <button
              onClick={() => setShowForceCompleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)', color: '#769E66' }}
            >
              <FastForward className="w-4 h-4" />
              إكمال إجباري
            </button>
          )}
        </div>
      </div>

      {/* Order Details Card */}
      <div className="card-warm p-6 mb-4">
        <button
          onClick={() => toggleSection('details')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-heading-700">معلومات الطلب</h2>
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
              {/* Service Info */}
              <div className="flex gap-4 p-4 bg-surface-50 rounded-xl">
                <div className="w-20 h-20 rounded-xl bg-surface-200 flex-shrink-0 overflow-hidden">
                  {order.serviceImage ? (
                    <img
                      src={order.serviceImage}
                      alt={order.serviceTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-heading-700 mb-1">{order.serviceTitle}</h3>
                  <p className="text-sm text-neutral-500 mb-2">
                    الكمية: {order.quantity || 1}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-bold">{order.finalPrice} ج.م</span>
                    {order.proposedPrice && order.proposedPrice !== order.originalPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        {order.originalPrice} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">تاريخ الطلب</p>
                    <p className="font-semibold text-heading-700">
                      {format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                  <Clock className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">آخر تحديث</p>
                    <p className="font-semibold text-heading-700">
                      {format(new Date(order.updatedAt), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800 font-medium mb-1">ملاحظات:</p>
                  <p className="text-amber-700">{order.notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Parties Info */}
      <div className="card-warm p-6 mb-4">
        <button
          onClick={() => toggleSection('parties')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-nature" />
            <h2 className="text-lg font-bold text-heading-700">أطراف الطلب</h2>
          </div>
          {expandedSections.parties ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {expandedSections.parties && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Buyer */}
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading-700">المشتري</p>
                    <p className="text-sm text-neutral-500">ID: {order.buyerId}</p>
                  </div>
                </div>
                <p className="font-medium text-heading-600">{order.buyerName}</p>
                <button
                  onClick={() => navigate(`/admin/users/${order.buyerId}`)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  عرض الملف الشخصي →
                </button>
              </div>

              {/* Seller */}
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-nature-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-nature-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading-700">البائع</p>
                    <p className="text-sm text-neutral-500">ID: {order.sellerId}</p>
                  </div>
                </div>
                <p className="font-medium text-heading-600">{order.sellerName}</p>
                <button
                  onClick={() => navigate(`/admin/users/${order.sellerId}`)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  عرض الملف الشخصي →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options */}
      {order.options && Object.keys(order.options).length > 0 && (
        <div className="card-warm p-6 mb-4">
          <h2 className="text-lg font-bold text-heading-700 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-nature" />
            الخيارات المختارة
          </h2>
          <div className="space-y-2">
            {Object.entries(order.options).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-surface-50 rounded-xl"
              >
                <span className="text-neutral-600">{key}</span>
                <span className="font-semibold text-heading-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="card-warm p-6">
          <button
            onClick={() => toggleSection('timeline')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warm" />
              <h2 className="text-lg font-bold text-heading-700">سجل التحديثات</h2>
            </div>
            {expandedSections.timeline ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {expandedSections.timeline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {index < order.timeline!.length - 1 && (
                        <div className="w-0.5 flex-1 bg-surface-300 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-heading-700">
                        {STATUS_LABELS[event.status]?.ar || event.status}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {format(new Date(event.timestamp), 'dd MMMM yyyy HH:mm', { locale: ar })}
                      </p>
                      {event.note && (
                        <p className="text-sm text-neutral-600 mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Force Cancel Modal */}
      <AnimatePresence>
        {showForceCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForceCancelModal(false)}
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
                  <h3 className="text-xl font-bold text-red-600">إلغاء إجباري</h3>
                  <p className="text-sm text-neutral-500">إجراء إداري - يتطلب توثيق</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                سيتم إلغاء هذا الطلب فوراً. هذا الإجراء لا يمكن التراجع عنه ويسجل في سجل التدقيق.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب الإلغاء الإجباري <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={forceCancelReason}
                    onChange={(e) => setForceCancelReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب اتخاذ هذا الإجراء الإداري..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForceCancelModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!forceCancelReason.trim()) {
                        toast.error('يرجى إدخال سبب الإلغاء');
                        return;
                      }
                      forceCancelMutation.mutate(forceCancelReason);
                    }}
                    disabled={forceCancelMutation.isPending}
                    className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {forceCancelMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'تأكيد الإلغاء'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force Complete Modal */}
      <AnimatePresence>
        {showForceCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForceCompleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <FastForward className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-600">إكمال إجباري</h3>
                  <p className="text-sm text-neutral-500">إجراء إداري - يتطلب توثيق</p>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                سيتم إكمال هذا الطلب فوراً وإصدار دفعة للبائع. هذا الإجراء يسجل في سجل التدقيق.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب الإكمال الإجباري <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={forceCompleteReason}
                    onChange={(e) => setForceCompleteReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب اتخاذ هذا الإجراء الإداري..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForceCompleteModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!forceCompleteReason.trim()) {
                        toast.error('يرجى إدخال سبب الإكمال');
                        return;
                      }
                      forceCompleteMutation.mutate(forceCompleteReason);
                    }}
                    disabled={forceCompleteMutation.isPending}
                    className="flex-1 bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {forceCompleteMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'تأكيد الإكمال'
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

export default AdminOrderDetailsPage;
