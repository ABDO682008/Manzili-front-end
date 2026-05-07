import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, AlertCircle, Check, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersApi } from '../../api';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';

const paymentMethods = [
  { id: 'Instapay', name: 'إنستاباي', account: 'manzili@instapay', desc: 'تحويل عبر إنستاباي' },
  { id: 'VodafoneCash', name: 'فودافون كاش', account: '0100 123 4567', desc: 'تحويل إلى محفظة فودافون كاش' },
];

export const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderIds, total } = (location.state || {}) as { orderIds?: number[]; total?: number };

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!orderIds?.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-surface-500 mb-4">لم يتم اختيار أي طلبات للدفع.</p>
        <button onClick={() => navigate('/payment/summary')}
          className="px-5 py-2.5 text-white font-medium rounded-xl"
          style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
          العودة لملخص الدفع
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('الحجم الأقصى للملف 10 ميجا'); return; }
    if (!file.type.startsWith('image/')) { toast.error('يرجى رفع ملف صورة'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(',')[1];
      setScreenshotBase64(base64);
      setScreenshotPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) { toast.error('يرجى اختيار طريقة الدفع'); return; }
    if (!screenshotBase64) { toast.error('يرجى رفع إيصال الدفع'); return; }

    setSubmitting(true);
    try {
      const res = await ordersApi.submitPayment({
        OrderIds: orderIds,
        PaymentScreenshot: screenshotBase64,
        Notes: notes || null,
      });

      if (res.success && res.data) {
        navigate('/payment/success', { state: res.data, replace: true });
      } else {
        toast.error('فشل إرسال الدفع. حاول مجدداً.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل إرسال الدفع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-5"
    >
      <h1 className="text-2xl font-bold text-surface-900">طريقة الدفع</h1>

      <div className="p-5 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
        <p className="text-white/70 text-sm mb-1">المبلغ الإجمالي</p>
        <p className="text-3xl font-bold">{formatCurrency(total || 0)}</p>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-surface-900">اختر طريقة الدفع</h2>
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full p-4 rounded-2xl border-[1.5px] text-right transition-all ${
              selectedMethod === method.id
                ? 'border-primary bg-primary-50'
                : 'border-surface-200 bg-white hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-surface-900">{method.name}</p>
                <p className="text-sm text-surface-500 mt-0.5">{method.desc}</p>
                {selectedMethod === method.id && (
                  <div className="mt-2 p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)' }}>
                    <p className="text-sm" style={{ color: '#ED8E3C' }}>
                      <span className="font-medium">الحساب: </span>{method.account}
                    </p>
                  </div>
                )}
              </div>
              {selectedMethod === method.id ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 me-3"
                  style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-surface-300 flex-shrink-0 me-3" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-surface-900">رفع إيصال الدفع</h2>
        {screenshotPreview ? (
          <div className="relative">
            <img src={screenshotPreview} alt="إيصال الدفع" className="max-h-56 w-full object-contain rounded-2xl border border-surface-200 bg-surface-50" />
            <button
              onClick={() => { setScreenshotBase64(null); setScreenshotPreview(null); }}
              className="absolute top-2 start-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-surface-600 hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-surface-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50/30 transition-all">
            <Upload className="w-10 h-10 text-surface-400 mx-auto mb-2" />
            <p className="font-medium text-surface-700">اضغط لرفع الإيصال</p>
            <p className="text-sm text-surface-400 mt-1">JPG أو PNG حتى 10 ميجا</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">ملاحظات (اختياري)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="أي تفاصيل إضافية عن الدفع..."
          className="w-full px-4 py-3 border-[1.5px] border-surface-200 rounded-xl text-sm outline-none focus:border-primary resize-none transition-all"
        />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl text-sm" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)', border: '1px solid rgba(237, 142, 60, 0.2)', color: '#ED8E3C' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ED8E3C' }} />
        <p>سيقوم فريقنا بمراجعة دفعتك خلال 24 ساعة وإخطارك بالتأكيد.</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !selectedMethod || !screenshotBase64}
        className="w-full py-3.5 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
      >
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        {submitting ? 'جاري الإرسال...' : 'إرسال إيصال الدفع'}
        {!submitting && <ArrowLeft className="w-5 h-5" />}
      </button>
    </motion.div>
  );
};
