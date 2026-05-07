import axiosInstance from './axiosInstance';
import type { ApiResponse, Discount, CreateDiscountRequest, PaginatedResponse } from '../types';

export const discountsApi = {
  getDiscounts: async (params?: { page?: number; pageSize?: number; isActive?: boolean }): Promise<ApiResponse<PaginatedResponse<Discount>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Discount>>>('/seller/discounts', { params });
    return response.data;
  },

  createDiscount: async (data: CreateDiscountRequest): Promise<ApiResponse<Discount>> => {
    const response = await axiosInstance.post<ApiResponse<Discount>>('/seller/discounts', data);
    return response.data;
  },

  deleteDiscount: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/seller/discounts/${id}`);
    return response.data;
  },

  toggleDiscountStatus: async (id: number): Promise<ApiResponse<Discount>> => {
    const response = await axiosInstance.patch<ApiResponse<Discount>>(`/seller/discounts/${id}/status`);
    return response.data;
  },

  validateDiscountCode: async (code: string): Promise<ApiResponse<{ valid: boolean; discount?: Discount }>> => {
    const response = await axiosInstance.get<ApiResponse<{ valid: boolean; discount?: Discount }>>(`/discounts/validate/${code}`);
    return response.data;
  },
};
