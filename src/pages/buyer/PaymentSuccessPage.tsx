import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag, Calendar, Hash, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils';
import type { SubmitPaymentResponse } from '../../api/orders.api';

export const PaymentSuccessPage = () => {
  const location = useLocation();
  const data = location.state as SubmitPaymentResponse | null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-lg mx-auto text-center py-12"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'linear-gradient(135deg, #769E66, #769E66)' }}
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">تم إرسال الدفع!</h1>
        <p className="text-surface-500">
          تم إرسال إيصال دفعتك بنجاح. سنراجعه ونؤكده خلال 24 ساعة.
        </p>
      </motion.div>

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="my-8 bg-white rounded-2xl p-5 text-right space-y-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <h2 className="font-semibold text-surface-900 mb-3 text-center">تأكيد الطلب</h2>

          {data.OrderNo && (
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(221, 100, 60, 0.1)' }}>
                <Hash className="w-4 h-4" style={{ color: '#DD643C' }} />
              </div>
              <div>
                <p className="text-xs text-surface-500">رقم الطلب</p>
                <p className="font-semibold text-surface-900">{data.OrderNo}</p>
              </div>
            </div>
          )}

          {data.PaymentDate && (
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(118, 158, 102, 0.1)' }}>
                <Calendar className="w-4 h-4" style={{ color: '#769E66' }} />
              </div>
              <div>
                <p className="text-xs text-surface-500">تاريخ الدفع</p>
                <p className="font-semibold text-surface-900">{formatDate(data.PaymentDate, 'PPp')}</p>
              </div>
            </div>
          )}

          {data.Total !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)' }}>
                <DollarSign className="w-4 h-4" style={{ color: '#ED8E3C' }} />
              </div>
              <div>
                <p className="text-xs text-surface-500">إجمالي المدفوع</p>
                <p className="font-bold text-lg" style={{ color: '#DD643C' }}>{formatCurrency(data.Total)}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <Link
          to="/orders"
          className="w-full py-3.5 flex items-center justify-center gap-2 text-white font-semibold rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
        >
          <Package className="w-5 h-5" />
          تابع أوامري
        </Link>

        <Link
          to="/services"
          className="w-full py-3.5 flex items-center justify-center gap-2 font-semibold rounded-2xl border-[1.5px] border-surface-200 text-surface-700 hover:bg-surface-50 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          تصفّح المزيد من الخدمات
        </Link>
      </motion.div>
    </motion.div>
  );
};
