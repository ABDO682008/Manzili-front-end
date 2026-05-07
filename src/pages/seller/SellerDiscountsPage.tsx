import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Copy } from 'lucide-react';
import { discountsApi } from '../../api';
import { Spinner, EmptyState, Badge, Button, Modal } from '../../components/common';
import toast from 'react-hot-toast';
import type { Discount } from '../../types';

export const SellerDiscountsPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    value: 10,
    type: 'Percentage' as const,
    usageLimit: 100,
    expiryDays: 30,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await discountsApi.getDiscounts();
      if (response.success && response.data) {
        setDiscounts(response.data.items);
      }
    } catch {
      // Mock data for demo
      setDiscounts([
        {
          id: 1,
          code: 'SUMMER2024',
          type: 'Percentage',
          value: 15,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          usageLimit: 100,
          usageCount: 23,
          isActive: true,
          sellerId: 1,
        },
        {
          id: 2,
          code: 'WELCOME10',
          type: 'Percentage',
          value: 10,
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          usageLimit: 50,
          usageCount: 48,
          isActive: true,
          sellerId: 1,
        },
        {
          id: 3,
          code: 'FLASH20',
          type: 'Percentage',
          value: 20,
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          endDate: new Date(Date.now() - 86400000).toISOString(),
          usageLimit: 20,
          usageCount: 20,
          isActive: false,
          sellerId: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || formData.value <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + formData.expiryDays);
      
      const response = await discountsApi.createDiscount({
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        usageLimit: formData.usageLimit,
      });
      
      if (response.success) {
        toast.success('تم إنشاء الخصم بنجاح');
        fetchDiscounts();
        setShowCreateModal(false);
        setFormData({ code: '', value: 10, type: 'Percentage' as const, usageLimit: 100, expiryDays: 30 });
      }
    } catch {
      // Mock creation
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + formData.expiryDays);
      
      const newDiscount: Discount = {
        id: Date.now(),
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        usageLimit: formData.usageLimit,
        usageCount: 0,
        isActive: true,
        sellerId: 1,
      };
      setDiscounts(prev => [newDiscount, ...prev]);
      toast.success('تم إنشاء الخصم');
      setShowCreateModal(false);
      setFormData({ code: '', value: 10, type: 'Percentage' as const, usageLimit: 100, expiryDays: 30 });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDiscount) return;
    
    setProcessing(true);
    try {
      await discountsApi.deleteDiscount(selectedDiscount.id);
      toast.success('Discount deleted');
      setDiscounts(prev => prev.filter(d => d.id !== selectedDiscount.id));
      setShowDeleteModal(false);
      setSelectedDiscount(null);
    } catch {
      setDiscounts(prev => prev.filter(d => d.id !== selectedDiscount.id));
      toast.success('Discount deleted');
      setShowDeleteModal(false);
      setSelectedDiscount(null);
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ الكود');
  };

  const getStatusBadge = (discount: Discount) => {
    if (!discount.isActive) {
      return <Badge variant="gray">غير نشط</Badge>;
    }
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return <Badge variant="danger">استُنفد</Badge>;
    }
    if (new Date(discount.endDate) < new Date()) {
      return <Badge variant="warning">منتهي</Badge>;
    }
    return <Badge variant="success">نشط</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>خصوماتي</h1>
          <p className="mt-1" style={{ color: '#9BA8B4' }}>إنشاء وإدارة أكواد الخصم</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إنشاء خصم
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#6B7B8C' }}>{discounts.length}</p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي الأكواد</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#769E66' }}>
            {discounts.filter(d => d.isActive && (!d.usageLimit || d.usageCount < d.usageLimit) && new Date(d.endDate) > new Date()).length}
          </p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>نشطة</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#DD643C' }}>
            {discounts.reduce((sum, d) => sum + d.usageCount, 0)}
          </p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>إجمالي الاستخدام</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-2xl font-bold" style={{ color: '#ED8E3C' }}>
            {discounts.length > 0
              ? Math.round(discounts.reduce((sum, d) => sum + (d.type === 'Percentage' ? d.value : 0), 0) / discounts.length)
              : 0}%
          </p>
          <p className="text-sm" style={{ color: '#9BA8B4' }}>متوسط الخصم</p>
        </div>
      </div>

      {/* Discounts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : discounts.length === 0 ? (
        <EmptyState
          type="default"
          title="لا توجد خصومات"
          message="أنشئ كود خصم الأول لجذب أكتر عملاء"
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الكود</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الخصم</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الاستخدام</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">تاريخ الانتهاء</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">الحالة</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {discounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" style={{ color: '#DD643C' }} />
                      <span className="font-mono font-medium" style={{ color: '#6B7B8C' }}>{discount.code}</span>
                      <button
                        onClick={() => copyCode(discount.code)}
                        className="p-1 rounded hover:bg-surface-100 transition-colors"
                        style={{ color: '#9BA8B4' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6B7B8C'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9BA8B4'}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold" style={{ color: '#DD643C' }}>{discount.value}{discount.type === 'Percentage' ? '%' : ' ج.م'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#6B7B8C' }}>
                    {discount.usageCount} / {discount.usageLimit || '∞'}
                    <div className="w-24 h-1.5 bg-surface-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${discount.usageLimit ? (discount.usageCount / discount.usageLimit) * 100 : 0}%`, backgroundColor: '#6B7B8C' }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#9BA8B4' }}>
                    {new Date(discount.endDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(discount)}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button
                      onClick={() => { setSelectedDiscount(discount); setShowDeleteModal(true); }}
                      className="p-2 rounded-xl hover:bg-primary-50 transition-colors"
                      style={{ color: '#9BA8B4' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DD643C'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9BA8B4'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormData({ code: '', value: 10, type: 'Percentage' as const, usageLimit: 100, expiryDays: 30 }); }}
        title="إنشاء كود خصم"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCreateModal(false); setFormData({ code: '', value: 10, type: 'Percentage' as const, usageLimit: 100, expiryDays: 30 }); }}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={processing}
              disabled={!formData.code || formData.value <= 0}
            >
              إنشاء
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
              الكود *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono"
              placeholder="مثال: SUMMER2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
                نسبة الخصم % *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
                حد الاستخدام
              </label>
              <input
                type="number"
                min={1}
                value={formData.usageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#6B7B8C' }}>
              ينتهي بعد (يوم)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={formData.expiryDays}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedDiscount(null); }}
        title="حذف الخصم"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setSelectedDiscount(null); }}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={processing}
            >
              حذف
            </Button>
          </>
        }
      >
        <p style={{ color: '#9BA8B4' }}>
          حذف كود الخصم "<strong style={{ color: '#6B7B8C' }}>{selectedDiscount?.code}</strong>"؟ الإجراء ده مش هينفع تراجعه.
        </p>
      </Modal>
    </div>
  );
};
