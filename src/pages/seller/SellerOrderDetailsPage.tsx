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
  RotateCcw,
  AlertCircle,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Hash,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionsApi } from '../../api/transactions.api';
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
      return <RefreshCw className="w-4 h-4" />;
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

export const SellerOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderId = parseInt(id || '0', 10);

  const [showRepriceModal, setShowRepriceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [repriceAmount, setRepriceAmount] = useState('');
  const [repriceReason, setRepriceReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    options: true,
    timeline: true,
  });

  const { data: orderResponse, isLoading } = useQuery({
    queryKey: ['seller-order', orderId],
    queryFn: () => transactionsApi.getTransactionById(orderId),
    enabled: !!orderId,
  });

  const order = orderResponse?.data;

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: () => transactionsApi.acceptRequest(orderId),
    onSuccess: () => {
      toast.success('تم قبول الطلب بنجاح 👌');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => transactionsApi.rejectRequest(orderId, { reason }),
    onSuccess: () => {
      toast.success('تم رفض الطلب');
      setShowRejectModal(false);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const repriceMutation = useMutation({
    mutationFn: ({ proposedPrice, reason }: { proposedPrice: number; reason: string }) =>
      transactionsApi.repriceRequest(orderId, { proposedPrice, reason }),
    onSuccess: () => {
      toast.success('تم إرسال السعر الجديد للعميل');
      setShowRepriceModal(false);
      setRepriceAmount('');
      setRepriceReason('');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const startWorkingMutation = useMutation({
    mutationFn: () => transactionsApi.startWorking(orderId),
    onSuccess: () => {
      toast.success('تم بدء العمل على الطلب 🎉');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const readyForShippingMutation = useMutation({
    mutationFn: () => transactionsApi.markReadyForShipping(orderId),
    onSuccess: () => {
      toast.success('الطلب جاهز للتسليم 📦');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
    },
    onError: () => toast.error('حدث خطأ، حاول مرة أخرى'),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => transactionsApi.cancelBySeller(orderId, { reason }),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب');
      setShowCancelModal(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['seller-order', orderId] });
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
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-heading-600 font-semibold mb-2">لم يتم العثور على الطلب</p>
          <button
            onClick={() => navigate('/seller/orders')}
            className="btn-primary mt-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  const canAccept = order.status === 'Request';
  const canReprice = order.status === 'Request';
  const canReject = order.status === 'Request';
  const canStartWorking = order.status === 'Paid' || order.status === 'Accepted' || order.status === 'AcceptedPrice';
  const canMarkReady = order.status === 'InProgress';
  const canCancel = ['Request', 'Accepted', 'AcceptedPrice', 'Paid', 'InProgress'].includes(order.status);
  const isFinalStatus = ['Completed', 'CancelledByBuyer', 'CancelledBySeller', 'Rejected', 'Expired'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate('/seller/orders')}
          className="p-2 rounded-xl hover:bg-surface-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-heading-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-heading-700">تفاصيل الطلب</h1>
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
              {isFinalStatus
                ? 'الطلب في حالة نهائية'
                : order.status === 'Request'
                ? 'بانتظار ردك على الطلب'
                : order.status === 'RePriced'
                ? 'بانتظار موافقة العميل على السعر الجديد'
                : order.status === 'Paid'
                ? 'العميل دفع، ابدأ العمل الآن'
                : order.status === 'InProgress'
                ? 'جاري تنفيذ الطلب'
                : order.status === 'ReadyForShipping'
                ? 'الطلب جاهز للتسليم'
                : order.status === 'OutForDelivery'
                ? 'الطلب في الطريق للعميل'
                : order.status === 'Delivered'
                ? 'تم التسليم، بانتظار تأكيد العميل'
                : 'الطلب قيد المعالجة'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <AnimatePresence>
        {!isFinalStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6"
          >
            {canAccept && (
              <button
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
                className="btn-nature flex items-center justify-center gap-2"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                قبول الطلب
              </button>
            )}

            {canReprice && (
              <button
                onClick={() => setShowRepriceModal(true)}
                className="btn-warm flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                تعديل السعر
              </button>
            )}

            {canReject && (
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-ghost border-2 border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                رفض الطلب
              </button>
            )}

            {canStartWorking && (
              <button
                onClick={() => startWorkingMutation.mutate()}
                disabled={startWorkingMutation.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {startWorkingMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                بدء التنفيذ
              </button>
            )}

            {canMarkReady && (
              <button
                onClick={() => readyForShippingMutation.mutate()}
                disabled={readyForShippingMutation.isPending}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {readyForShippingMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
                جاهز للتسليم
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-ghost border border-surface-300 text-heading-500 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                إلغاء الطلب
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Buyer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl">
                  <User className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">العميل</p>
                    <p className="font-semibold text-heading-700">{order.buyerName}</p>
                  </div>
                </div>

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
              </div>

              {order.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm text-amber-800 font-medium mb-1">ملاحظات العميل:</p>
                  <p className="text-amber-700">{order.notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options Card */}
      {order.options && Object.keys(order.options).length > 0 && (
        <div className="card-warm p-6 mb-4">
          <button
            onClick={() => toggleSection('options')}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-nature" />
              <h2 className="text-lg font-bold text-heading-700">الخيارات المختارة</h2>
            </div>
            {expandedSections.options ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {expandedSections.options && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                {Object.entries(order.options).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-surface-50 rounded-xl"
                  >
                    <span className="text-neutral-600">{key}</span>
                    <span className="font-semibold text-heading-700">{value}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Timeline Card */}
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

      {/* Reprice Modal */}
      <AnimatePresence>
        {showRepriceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRepriceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-heading-700 mb-4">تعديل السعر</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    السعر الجديد (ج.م)
                  </label>
                  <input
                    type="number"
                    value={repriceAmount}
                    onChange={(e) => setRepriceAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-surface-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="أدخل السعر الجديد"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    السعر الحالي: {order.finalPrice} ج.م
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب تعديل السعر
                  </label>
                  <textarea
                    value={repriceReason}
                    onChange={(e) => setRepriceReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-surface-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب تعديل السعر للعميل..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRepriceModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      const price = parseFloat(repriceAmount);
                      if (price <= 0) {
                        toast.error('السعر يجب أن يكون أكبر من صفر');
                        return;
                      }
                      repriceMutation.mutate({ proposedPrice: price, reason: repriceReason });
                    }}
                    disabled={!repriceAmount || repriceMutation.isPending}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {repriceMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'إرسال'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-red-600 mb-4">رفض الطلب</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب الرفض <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب رفض الطلب..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        toast.error('يرجى إدخال سبب الرفض');
                        return;
                      }
                      rejectMutation.mutate(rejectReason);
                    }}
                    disabled={rejectMutation.isPending}
                    className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'رفض الطلب'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-red-600 mb-4">إلغاء الطلب</h3>
              <p className="text-neutral-600 mb-4">
                هل أنت متأكد من إلغاء هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading-600 mb-2">
                    سبب الإلغاء <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="اشرح سبب الإلغاء..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 btn-ghost"
                  >
                    تراجع
                  </button>
                  <button
                    onClick={() => {
                      if (!cancelReason.trim()) {
                        toast.error('يرجى إدخال سبب الإلغاء');
                        return;
                      }
                      cancelMutation.mutate(cancelReason);
                    }}
                    disabled={cancelMutation.isPending}
                    className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'إلغاء الطلب'
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

export default SellerOrderDetailsPage;
