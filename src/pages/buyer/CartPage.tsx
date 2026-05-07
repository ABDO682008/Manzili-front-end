import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { cartApi } from '../../api';
import { Spinner, EmptyState, Button, ConfirmDialog } from '../../components/common';
import { useCartStore } from '../../stores';
import { formatCurrency } from '../../utils';
import toast from 'react-hot-toast';
import type { CartItem } from '../../types';

export const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const navigate = useNavigate();
  const setCartCount = useCartStore((state) => state.setCount);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        setCartItems(response.data);
        setCartCount(response.data.length);
      }
    } catch {
      toast.error('فشل تحميل العربة');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await cartApi.updateCartItem(id, { quantity: newQuantity });
      if (response.success) {
        setCartItems(prev => prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch {
      toast.error('فشل تحديث الكمية');
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      const response = await cartApi.removeFromCart(id);
      if (response.success) {
        setCartItems(prev => prev.filter(item => item.id !== id));
        setCartCount(cartItems.length - 1);
        toast.success('تم حذف المنتج من العربة');
      }
    } catch {
      toast.error('فشل حذف المنتج');
    } finally {
      setItemToRemove(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setSubmitting(true);
    try {
      const response = await cartApi.checkout();
      if (response.success && response.data) {
        setCartItems([]);
        setCartCount(0);
        navigate('/requests/confirmation', { 
          state: { count: response.data.count }
        });
      }
    } catch {
      toast.error('فشل إرسال الطلبات');
    } finally {
      setSubmitting(false);
    }
  };

  // Group by seller
  const groupedItems = cartItems.reduce((acc, item) => {
    const sellerId = item.sellerId;
    if (!acc[sellerId]) {
      acc[sellerId] = { sellerName: item.sellerName, items: [] };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<number, { sellerName: string; items: CartItem[] }>);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        type="cart"
        actionLabel="Browse Services"
        onAction={() => navigate('/services')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#6B7B8C' }}>عربة التسوق</h1>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl mb-6" style={{ backgroundColor: 'rgba(107, 123, 140, 0.1)', border: '1px solid rgba(107, 123, 140, 0.2)' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#6B7B8C' }} />
        <p className="text-sm" style={{ color: '#6B7B8C' }}>
          إضافة منتج للعربة بيكون <strong>طلب</strong> للبائع — مش شراء مباشر.
          الدفع بيكون بعد موافقة البائع.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedItems).map(([sellerId, group]) => (
            <div key={sellerId} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
                <p className="font-medium" style={{ color: '#6B7B8C' }}>البائع: {group.sellerName}</p>
              </div>

              {group.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4 border-b border-surface-100 last:border-0">
                  <div className="w-20 h-20 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.serviceImage ? (
                      <img src={item.serviceImage} alt={item.serviceTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#9BA8B4' }}>
                        لا يوجد صورة
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/services/${item.serviceId}`}
                      className="font-medium hover:text-primary line-clamp-1 transition-colors"
                      style={{ color: '#6B7B8C' }}
                    >
                      {item.serviceTitle}
                    </Link>

                    {item.options && Object.entries(item.options).length > 0 && (
                      <p className="text-sm mt-1" style={{ color: '#9BA8B4' }}>
                        {Object.entries(item.options).map(([key, val]) => `${key}: ${val}`).join(', ')}
                      </p>
                    )}

                    <p className="font-bold mt-2" style={{ color: '#DD643C' }}>
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => setItemToRemove(item.id)}
                      className="p-2 rounded-xl transition-colors hover:bg-primary-50"
                      style={{ color: '#9BA8B4' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DD643C'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9BA8B4'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 transition-colors"
                        style={{ color: '#6B7B8C' }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium" style={{ color: '#6B7B8C' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
                        style={{ color: '#6B7B8C' }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-6">
            <h2 className="font-semibold mb-4" style={{ color: '#6B7B8C' }}>ملخص الطلب</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: '#9BA8B4' }}>
                <span>المنتجات ({cartItems.length})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              <div className="border-t border-surface-100 pt-3">
                <div className="flex justify-between font-semibold text-lg" style={{ color: '#6B7B8C' }}>
                  <span>الإجمالي</span>
                  <span style={{ color: '#DD643C' }}>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              isLoading={submitting}
              fullWidth
              size="lg"
              className="mt-6"
            >
              إرسال الطلبات
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>

            <p className="mt-4 text-xs text-center" style={{ color: '#9BA8B4' }}>
              البائعين هيردوا في خلال ٤٨ ساعة
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={itemToRemove !== null}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => itemToRemove && handleRemoveItem(itemToRemove)}
        title="حذف المنتج"
        message="متأكد إنك عايز تمسح المنتج ده من العربة؟"
        confirmLabel="حذف"
      />
    </div>
  );
};
