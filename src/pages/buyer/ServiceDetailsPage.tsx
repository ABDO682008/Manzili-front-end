import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Crown, Minus, Plus, Loader2, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { servicesApi, ordersApi } from '../../api';
import { Spinner, ErrorState } from '../../components/common';
import { formatCurrency, getImageUrl } from '../../utils';
import toast from 'react-hot-toast';
import type { ServiceDetail } from '../../api/services.api';
import type { RequestServiceData } from '../../api/orders.api';

export const ServiceDetailsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [optionSelections, setOptionSelections] = useState<
    Record<number, Array<{ optionId: number; quantity: number }>>
  >({});

  useEffect(() => {
    if (!serviceId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await servicesApi.getServiceById(Number(serviceId));
        if (res.success && res.data) {
          setService(res.data);
          const defaults: Record<number, Array<{ optionId: number; quantity: number }>> = {};
          res.data.optionGroups?.forEach((g) => {
            if (g.isRequired && g.options.length > 0) {
              defaults[g.id] = [{ optionId: g.options[0].id, quantity: 1 }];
            }
          });
          setOptionSelections(defaults);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [serviceId]);

  const toggleOption = (groupId: number, optionId: number, allowMultiple: boolean) => {
    setOptionSelections((prev) => {
      const current = prev[groupId] || [];
      const exists = current.find((s) => s.optionId === optionId);
      if (exists) {
        const updated = current.filter((s) => s.optionId !== optionId);
        return { ...prev, [groupId]: updated };
      }
      if (allowMultiple) {
        return { ...prev, [groupId]: [...current, { optionId, quantity: 1 }] };
      }
      return { ...prev, [groupId]: [{ optionId, quantity: 1 }] };
    });
  };

  const isSelected = (groupId: number, optionId: number) =>
    (optionSelections[groupId] || []).some((s) => s.optionId === optionId);

  const calcExtraPrice = () => {
    if (!service) return 0;
    let extra = 0;
    service.optionGroups?.forEach((g) => {
      const sel = optionSelections[g.id] || [];
      sel.forEach(({ optionId }) => {
        const opt = g.options.find((o) => o.id === optionId);
        if (opt) extra += opt.priceAdjustment;
      });
    });
    return extra;
  };

  const totalPrice = service ? (service.basePrice + calcExtraPrice()) * quantity : 0;

  const handleRequestService = async () => {
    if (!service) return;

    const unmet = service.optionGroups?.filter(
      (g) => g.isRequired && !(optionSelections[g.id]?.length)
    );
    if (unmet?.length) {
      toast.error(`يرجى اختيار خيار لـ: ${unmet.map((g) => g.name).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: RequestServiceData = {
        serviceId: service.id,
        customizationText: customizationText || '',
        quantity,
        optionGroups: Object.entries(optionSelections)
          .filter(([, items]) => items.length > 0)
          .map(([groupId, items]) => ({
            groupId: Number(groupId),
            items,
          })),
      };

      const res = await ordersApi.requestService(payload);
      if (res.success) {
        toast.success('تم إرسال طلبك! تابع حالته في صفحة الطلبات.');
        navigate('/requests');
      } else {
        toast.error('فشل إرسال الطلب. حاول مجدداً.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'فشل إرسال الطلب';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Spinner size="xl" />
    </div>
  );

  if (error || !service) return (
    <div className="max-w-2xl mx-auto">
      <ErrorState title="الخدمة غير موجودة" message="هذه الخدمة غير متاحة أو تم حذفها." onRetry={() => window.location.reload()} />
    </div>
  );

  const images = service.images || [];
  const currentImage = images[activeImageIndex]?.imageUrl;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-neutral-500 hover:text-heading-700 transition-colors text-sm">
        <ChevronRight className="w-4 h-4" /> رجوع
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
          <div className="aspect-video bg-surface-100 rounded-2xl overflow-hidden">
            <img
              src={getImageUrl(currentImage)}
              alt={service.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-service.jpg'; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={getImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-heading-700 mb-2">{service.title}</h1>

            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}>
                {service.provider?.fullName?.[0] || 'م'}
              </div>
              <div>
                <p className="font-semibold text-heading-700 flex items-center gap-2">
                  {service.provider?.fullName}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(237, 142, 60, 0.1)', color: '#ED8E3C' }}>
                    <Crown className="w-3 h-3" /> مميّز
                  </span>
                </p>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <Star className="w-3.5 h-3.5" style={{ color: '#ED8E3C', fill: '#ED8E3C' }} />
                  <span className="font-medium text-surface-700">{(service.provider?.rating || 0).toFixed(1)}</span>
                  <span>({service.provider?.reviewsNo || 0} تقييم)</span>
                </div>
              </div>
            </div>

            {service.address && (
              <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{service.address}</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-heading-700">{formatCurrency(service.basePrice)}</span>
            {calcExtraPrice() > 0 && (
              <span className="text-sm text-neutral-500">+ {formatCurrency(calcExtraPrice())} إضافات</span>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-heading-700 mb-2">عن هذه الخدمة</h3>
            <p className="text-surface-600 text-sm leading-relaxed whitespace-pre-wrap">{service.serviceDescription}</p>
          </div>

          {service.optionGroups?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-heading-700">خصّص طلبك</h3>
              {service.optionGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <label className="text-sm font-medium text-surface-700 flex items-center gap-1">
                    {group.name}
                    {group.isRequired && <span className="text-red-500 text-xs">*مطلوب</span>}
                    {group.allowMultiple && <span className="text-xs text-surface-400">(اختيار متعدد)</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const selected = isSelected(group.id, opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleOption(group.id, opt.id, group.allowMultiple)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border-[1.5px] transition-all flex items-center gap-1.5 ${
                            selected
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-[0_0_0_1px_rgba(79,70,229,0.2)]'
                              : 'border-surface-200 text-surface-700 hover:border-brand-300'
                          }`}
                        >
                          {selected && <CheckCircle className="w-3.5 h-3.5 text-brand-600" />}
                          {opt.name}
                          {opt.priceAdjustment > 0 && (
                            <span className="text-xs text-neutral-500">+{formatCurrency(opt.priceAdjustment)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-surface-700 block mb-2">الكمية</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold text-heading-700">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-surface-700 block mb-2">ملاحظات خاصة (اختياري)</label>
            <textarea
              value={customizationText}
              onChange={(e) => setCustomizationText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="اذكر أي متطلبات خاصة..."
              className="w-full px-3 py-2.5 border-[1.5px] border-surface-200 rounded-xl text-sm focus:border-brand-500 outline-none resize-none transition-all"
            />
            <p className="text-xs text-surface-400 mt-1 text-start">{customizationText.length}/500</p>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500">الإجمالي المتوقع</span>
              <span className="text-xl font-bold text-brand-600">{formatCurrency(totalPrice)}</span>
            </div>
            <button
              onClick={handleRequestService}
              disabled={submitting}
              className="w-full py-3.5 px-6 text-white font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #DD643C, #ED8E3C)' }}
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? 'جاري الإرسال...' : 'طلب هذه الخدمة'}
            </button>
            <p className="text-xs text-surface-400 text-center mt-2">
              سيراجع البائع طلبك ويؤكده. لا تدفع إلا بعد الموافقة.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
