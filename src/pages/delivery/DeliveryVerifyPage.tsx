import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Package,
  User,
  MapPin,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Keyboard,
  QrCode,
  AlertCircle,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionsApi } from '../../api/transactions.api';
import { deliveryApi } from '../../api/delivery.api';
import { STATUS_LABELS } from '../../types';

export const DeliveryVerifyPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const id = parseInt(orderId || '0', 10);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isUsingScanner, setIsUsingScanner] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: orderResponse, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['delivery-order', id],
    queryFn: () => transactionsApi.getTransactionById(id),
    enabled: !!id,
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => deliveryApi.verifyDelivery(id, code),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('تم تأكيد التسليم بنجاح! 🎉');
        navigate('/delivery/success', { state: { orderId: id } });
      } else {
        toast.error(response.message || 'كود التسليم غير صحيح');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    },
    onError: () => {
      toast.error('حدث خطأ، حاول مرة أخرى');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  const order = orderResponse?.data;

  useEffect(() => {
    if (code.every((c) => c !== '')) {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        verifyMutation.mutate(fullCode);
      }
    }
  }, [code]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    if (pasted.length === 6) {
      verifyMutation.mutate(pasted);
    } else if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  if (isLoadingOrder) {
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
          <button onClick={() => navigate('/delivery')} className="btn-primary mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </button>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'Delivered' || order.status === 'Completed';

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate('/delivery/my-deliveries')}
          className="p-2 rounded-xl hover:bg-surface-200 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-heading-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-heading-700">تأكيد التسليم</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
            <Hash className="w-4 h-4" />
            طلب #{id}
          </p>
        </div>
      </motion.div>

      {/* Status Banner */}
      {isDelivered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 text-green-700 border border-green-200 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">تم التسليم مسبقاً</p>
              <p className="text-sm opacity-80">هذا الطلب تم تسليمه بنجاح</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-warm p-5 mb-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-heading-700">{order.serviceTitle}</p>
            <p className="text-sm text-neutral-500">{STATUS_LABELS[order.status]?.ar}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-surface-200">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-500">المستلم</p>
              <p className="font-medium text-heading-700">{order.buyerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-500">حالة التسليم</p>
              <p className="font-medium text-heading-700">
                {order.deliveryCode ? 'تم التسليم' : 'بانتظار التسليم'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verify Section */}
      {!isDelivered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-warm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-heading-700">كود التسليم</h2>
            </div>
            <button
              onClick={() => setIsUsingScanner(!isUsingScanner)}
              className="p-2 rounded-lg hover:bg-surface-200 transition-colors"
            >
              {isUsingScanner ? (
                <Keyboard className="w-5 h-5 text-neutral-500" />
              ) : (
                <QrCode className="w-5 h-5 text-neutral-500" />
              )}
            </button>
          </div>

          <p className="text-neutral-600 text-center mb-6">
            اطلب من العميل إدخال كود التسليم المكون من 6 أرقام
          </p>

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyMutation.isPending}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 ${
                  digit
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-surface-300 hover:border-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Loading State */}
          {verifyMutation.isPending && (
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-500">جاري التحقق...</p>
            </div>
          )}

          {/* Manual Confirm Button */}
          {code.every((c) => c !== '') && !verifyMutation.isPending && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full btn-primary"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              تأكيد التسليم
            </button>
          )}
        </motion.div>
      )}

      {/* Cannot Deliver Option */}
      {!isDelivered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate(`/delivery/failed`, { state: { orderId: id } })}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            لا يمكن تسليم الطلب؟
          </button>
        </motion.div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-heading-700 text-center mb-2">
                تأكيد التسليم
              </h3>
              <p className="text-neutral-600 text-center mb-6">
                هل أنت متأكد من تسليم هذا الطلب للعميل {order.buyerName}؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 btn-ghost"
                >
                  تراجع
                </button>
                <button
                  onClick={() => {
                    const fullCode = code.join('');
                    verifyMutation.mutate(fullCode);
                    setShowConfirmModal(false);
                  }}
                  disabled={verifyMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'تأكيد'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryVerifyPage;
