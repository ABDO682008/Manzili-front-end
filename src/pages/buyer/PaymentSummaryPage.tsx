import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersApi } from '../../api';
import { Spinner, EmptyState } from '../../components/common';
import { formatCurrency } from '../../utils';
import { getImageUrl } from '../../utils';
import type { PaymentSummaryResponse } from '../../api/orders.api';

export const PaymentSummaryPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getPaymentSummary().then((res) => {
      if (res.success && res.data) setSummary(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="xl" /></div>
  );

  if (!summary || !summary.Services?.length) return (
    <EmptyState
      type="default"
      title="لا توجد مدفوعات معلقة"
      message="ليس لديك طلبات مقبولة في انتظار الدفع."
      actionLabel="عرض الطلبات"
      onAction={() => navigate('/requests')}
    />
  );

  const orderIds = summary.Services.map((s) => s.OrderId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      <h1 className="text-2xl font-bold text-heading-700">ملخص الدفع</h1>

      <div className="flex items-start gap-3 p-4 rounded-2xl text-sm" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)', border: '1px solid rgba(107, 123, 140, 0.2)', color: '#6B7B8C' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#6B7B8C' }} />
        <p>يتم مراجعة الدفع يدوياً وتأكيده خلال 24 ساعة من رفع إيصال الدفع.</p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="font-semibold text-heading-700">الخدمات المراد دفعها</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {summary.Services.map((service) => (
            <div key={service.OrderId} className="p-4 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0">
                <img
                  src={getImageUrl(service.Image)}
                  alt={service.Title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-heading-700 text-sm">{service.Title}</p>
                <p className="text-xs text-surface-500 mt-0.5">الكمية: {service.Quantity}</p>
                {service.Options?.length > 0 && (
                  <p className="text-xs text-surface-400 mt-1">
                    {service.Options.map((o) => `${o.Name} x${o.Quantity}`).join('، ')}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-heading-700">{formatCurrency(service.Price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary.Address && (
        <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h3 className="font-semibold text-heading-700 text-sm mb-2">عنوان التوصيل</h3>
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <MapPin className="w-4 h-4" style={{ color: '#DD643C' }} />
            <span>{summary.Address.AddressPreview}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-600">
            <Phone className="w-4 h-4" style={{ color: '#DD643C' }} />
            <span>{summary.Address.Phone}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <h3 className="font-semibold text-heading-700">تفاصيل الأسعار</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">المجموع الفرعي</span>
            <span className="font-medium">{formatCurrency(summary.PriceBreakdown.Subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">رسوم التوصيل</span>
            <span className="font-medium">{formatCurrency(summary.PriceBreakdown.DeliveryFees)}</span>
          </div>
          <div className="border-t border-surface-100 pt-2 flex justify-between">
            <span className="font-bold text-heading-700">الإجمالي</span>
            <span className="font-bold text-xl" style={{ color: '#DD643C' }}>{formatCurrency(summary.PriceBreakdown.Total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/payment/method', { state: { orderIds, total: summary.PriceBreakdown.Total } })}
        className="w-full py-3.5 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
      >
        اختر طريقة الدفع <ArrowLeft className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
