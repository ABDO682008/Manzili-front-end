import { useCallback } from 'react';
import { cartApi } from '../api';
import { useCartStore } from '../stores';
import toast from 'react-hot-toast';

export const useCart = () => {
  const { itemCount, fetchCartCount, incrementCount, decrementCount, setCount } = useCartStore();

  const addToCart = useCallback(async (data: {
    serviceId: number;
    quantity: number;
    options?: Record<string, string>;
    notes?: string;
  }) => {
    try {
      const response = await cartApi.addToCart(data);
      if (response.success) {
        incrementCount();
        toast.success('Added to cart');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to add to cart');
      return false;
    }
  }, [incrementCount]);

  const removeFromCart = useCallback(async (id: number) => {
    try {
      const response = await cartApi.removeFromCart(id);
      if (response.success) {
        decrementCount();
        toast.success('Removed from cart');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to remove from cart');
      return false;
    }
  }, [decrementCount]);

  const updateQuantity = useCallback(async (id: number, quantity: number) => {
    try {
      const response = await cartApi.updateCartItem(id, { quantity });
      if (response.success) {
        fetchCartCount();
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to update quantity');
      return false;
    }
  }, [fetchCartCount]);

  const checkout = useCallback(async () => {
    try {
      const response = await cartApi.checkout();
      if (response.success && response.data) {
        setCount(0);
        toast.success(`${response.data.count} request(s) sent to sellers!`);
        return response.data;
      }
      return null;
    } catch (error) {
      toast.error('Failed to submit requests');
      return null;
    }
  }, [setCount]);

  return {
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
    refreshCart: fetchCartCount,
  };
};
