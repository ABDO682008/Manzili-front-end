import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sellerApi, categoriesApi } from '../../api';
import { Button, Input, Spinner } from '../../components/common';
import toast from 'react-hot-toast';
import type { Category } from '../../api/categories.api';

export const UpdateServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, svcRes] = await Promise.all([
          categoriesApi.getCategories(),
          sellerApi.getServiceById(Number(id)),
        ]);

        if (catRes.success && catRes.data) setCategories(catRes.data.items || []);

        if (svcRes.success && svcRes.data) {
          const s = svcRes.data;
          setTitle(s.Title || '');
          setBasePrice(String(s.BasePrice || ''));
        }
      } catch {
        toast.error('فشل تحميل الخدمة');
        navigate('/seller/services');
      } finally {
        setLoading(false);
      }
    };
    if (id) init();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (newImages.length + files.length > 5) { toast.error('الحد الأقصى 5 صور'); return; }
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    setNewImages((prev) => [...prev, ...valid]);
    setNewImagePreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (categoryId) updateData.categoryId = categoryId;
      if (basePrice) updateData.basePrice = Number(basePrice);
      if (newImages.length) updateData.images = newImages;

      const res = await sellerApi.updateService(Number(id), updateData);
      if (res.success) {
        toast.success('تم تحديث الخدمة!');
        navigate('/seller/services');
      } else {
        toast.error('فشل التحديث');
      }
    } catch {
      toast.error('فشل التحديث');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="xl" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">تعديل الخدمة</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-surface-900">المعلومات الأساسية</h2>

          <Input label="عنوان الخدمة" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الخدمة" maxLength={100} />

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">الفئة</label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-[1.5px] border-surface-200 rounded-xl focus:border-brand-500 outline-none text-sm"
              >
                <option value="">— اترك كما هو —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اتركه فارغاً للإبقاء على الوصف الحالي"
              rows={4}
              className="w-full px-4 py-2.5 border-[1.5px] border-surface-200 rounded-xl focus:border-brand-500 outline-none resize-none text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-surface-900 mb-3">التسعير</h2>
          <Input label="السعر الأساسي (جنيه)" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="مثال: 500" min="1" />
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-semibold text-surface-900 mb-4">إضافة صور جديدة</h2>
          <div className="grid grid-cols-4 gap-3">
            {newImagePreviews.map((preview, i) => (
              <div key={i} className="relative aspect-square bg-surface-100 rounded-xl overflow-hidden">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => {
                  setNewImages((prev) => prev.filter((_, idx) => idx !== i));
                  setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
                }} className="absolute top-1 start-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {newImages.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 transition-all">
                <Upload className="w-5 h-5 text-surface-400 mb-1" />
                <span className="text-xs text-surface-400">إضافة</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            حفظ التغييرات
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/seller/services')}>
            إلغاء
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
