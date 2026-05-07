import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sellerApi, categoriesApi } from '../../api';
import { Button, Input } from '../../components/common';
import toast from 'react-hot-toast';
import type { Category } from '../../api/categories.api';

interface OptionGroup {
  name: string;
  isRequired: boolean;
  allowMultiple: boolean;
  options: Array<{ name: string; price: number }>;
}

export const CreateServicePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);

  useEffect(() => {
    categoriesApi.getCategories().then((res) => {
      if (res.success && res.data) {
        const items = res.data.items || [];
        setCategories(items);
        if (items.length > 0) setCategoryId(items[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error('الحد الأقصى 5 صور'); return; }
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} كبيرة جداً`); return false; }
      return f.type.startsWith('image/');
    });
    setImages((prev) => [...prev, ...valid]);
    setImagePreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addGroup = () => setOptionGroups((prev) => [...prev, { name: '', isRequired: false, allowMultiple: false, options: [{ name: '', price: 0 }] }]);
  const removeGroup = (i: number) => setOptionGroups((prev) => prev.filter((_, idx) => idx !== i));
  const updateGroup = (i: number, field: keyof OptionGroup, value: unknown) =>
    setOptionGroups((prev) => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));
  const addOption = (gi: number) =>
    setOptionGroups((prev) => prev.map((g, i) => i === gi ? { ...g, options: [...g.options, { name: '', price: 0 }] } : g));
  const removeOption = (gi: number, oi: number) =>
    setOptionGroups((prev) => prev.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g));
  const updateOption = (gi: number, oi: number, field: string, value: unknown) =>
    setOptionGroups((prev) => prev.map((g, i) =>
      i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, [field]: value } : o) } : g
    ));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { toast.error('يرجى رفع صورة واحدة على الأقل'); return; }
    if (!categoryId) { toast.error('يرجى اختيار فئة'); return; }

    setIsSubmitting(true);
    try {
      const res = await sellerApi.createService({
        title,
        description,
        categoryId,
        basePrice: Number(basePrice),
        images,
        optionGroups: optionGroups.filter((g) => g.name && g.options.some((o) => o.name)),
      });

      if (res.success) {
        toast.success('تم إنشاء الخدمة بنجاح!');
        navigate('/seller/services');
      } else {
        toast.error('فشل إنشاء الخدمة');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل إنشاء الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-heading-700 mb-6">إنشاء خدمة جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-heading-700">المعلومات الأساسية</h2>

          <Input label="عنوان الخدمة *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تنظيف منزل احترافي" required maxLength={100} />

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">الفئة *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 border-[1.5px] border-surface-200 rounded-xl focus:border-brand-500 outline-none text-sm"
              required
            >
              {categories.length === 0 && <option value="">جاري تحميل الفئات...</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">الوصف * (20 حرف كحد أدنى)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف خدمتك بالتفصيل..."
              minLength={20}
              rows={4}
              className="w-full px-4 py-2.5 border-[1.5px] border-surface-200 rounded-xl focus:border-brand-500 outline-none resize-none text-sm"
              required
            />
            <p className="text-xs text-surface-400 mt-1">{description.length} حرف</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-heading-700">التسعير</h2>
          <Input
            label="السعر الأساسي (جنيه) *"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="مثال: 500"
            min="1"
            required
          />
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-heading-700 mb-4">الصور * (من 1 إلى 5 صور)</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative aspect-square bg-surface-100 rounded-xl overflow-hidden">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 start-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                <Upload className="w-6 h-6 text-surface-400 mb-1" />
                <span className="text-xs text-surface-400">إضافة</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-2">JPG/PNG، الحد الأقصى 5 ميجا لكل صورة</p>
        </div>

        {/* Option Groups */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-heading-700">خيارات التخصيص</h2>
              <p className="text-xs text-surface-500 mt-0.5">أضف خيارات كالحجم أو اللون أو الإضافات</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addGroup}>
              <Plus className="w-4 h-4 ms-1" /> إضافة مجموعة
            </Button>
          </div>

          {optionGroups.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-4">لا توجد خيارات. اضغط "إضافة مجموعة" للسماح بالتخصيص.</p>
          ) : (
            <div className="space-y-4">
              {optionGroups.map((group, gi) => (
                <div key={gi} className="p-4 border border-surface-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(gi, 'name', e.target.value)}
                      placeholder="اسم المجموعة (مثال: الحجم)"
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm outline-none focus:border-brand-500"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-surface-600">
                      <input type="checkbox" checked={group.isRequired} onChange={(e) => updateGroup(gi, 'isRequired', e.target.checked)} />
                      مطلوب
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-surface-600">
                      <input type="checkbox" checked={group.allowMultiple} onChange={(e) => updateGroup(gi, 'allowMultiple', e.target.checked)} />
                      متعدد
                    </label>
                    <button type="button" onClick={() => removeGroup(gi)} className="text-red-400 hover:text-red-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateOption(gi, oi, 'name', e.target.value)}
                          placeholder="اسم الخيار"
                          className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm outline-none focus:border-brand-500"
                        />
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => updateOption(gi, oi, 'price', Number(e.target.value))}
                          placeholder="+سعر ج"
                          className="w-24 px-3 py-2 border border-surface-200 rounded-lg text-sm outline-none focus:border-brand-500"
                        />
                        {group.options.length > 1 && (
                          <button type="button" onClick={() => removeOption(gi, oi)} className="text-surface-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(gi)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      + إضافة خيار
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            إنشاء الخدمة
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/seller/services')}>
            إلغاء
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
