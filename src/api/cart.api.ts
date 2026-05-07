import axiosInstance from './axiosInstance';
import type { ApiResponse, CartItem } from '../types';

export const cartApi = {
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    const response = await axiosInstance.get<ApiResponse<CartItem[]>>('/cart');
    return response.data;
  },

  addToCart: async (data: {
    serviceId: number;
    quantity: number;
    options?: Record<string, string>;
    notes?: string;
  }): Promise<ApiResponse<CartItem>> => {
    const response = await axiosInstance.post<ApiResponse<CartItem>>('/cart/items', data);
    return response.data;
  },

  updateCartItem: async (id: number, data: { quantity: number; notes?: string }): Promise<ApiResponse<CartItem>> => {
    const response = await axiosInstance.patch<ApiResponse<CartItem>>(`/cart/items/${id}`, data);
    return response.data;
  },

  removeFromCart: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/cart/items/${id}`);
    return response.data;
  },

  checkout: async (): Promise<ApiResponse<{ requestIds: number[]; count: number }>> => {
    const response = await axiosInstance.post<ApiResponse<{ requestIds: number[]; count: number }>>('/cart/checkout');
    return response.data;
  },

  clearCart: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>('/cart');
    return response.data;
  },
};
