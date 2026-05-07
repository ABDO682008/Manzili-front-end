import { create } from 'zustand';
import { cartApi } from '../api';

interface CartState {
  itemCount: number;
  isLoading: boolean;
  fetchCartCount: () => Promise<void>;
  incrementCount: (amount?: number) => void;
  decrementCount: (amount?: number) => void;
  setCount: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  isLoading: false,

  fetchCartCount: async () => {
    set({ isLoading: true });
    try {
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        const count = response.data.length;
        set({ itemCount: count, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  incrementCount: (amount = 1) =>
    set((state) => ({ itemCount: state.itemCount + amount })),

  decrementCount: (amount = 1) =>
    set((state) => ({ itemCount: Math.max(0, state.itemCount - amount) })),

  setCount: (count) => set({ itemCount: count }),
}));
