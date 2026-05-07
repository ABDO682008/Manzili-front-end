import axiosInstance from './axiosInstance';
import type { ApiResponse, PaginatedResponse, Transaction } from '../types';

export const deliveryApi = {
  trackOrder: async (orderId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(`/orders/${orderId}/track`);
    return response.data;
  },

  getAvailableDeliveries: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>('/delivery/available');
    return response.data;
  },

  acceptDelivery: async (orderId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/delivery/${orderId}/accept`);
    return response.data;
  },

  getMyDeliveries: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>('/delivery/mine', { params });
    return response.data;
  },

  verifyDelivery: async (orderId: number, code: string): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/delivery/${orderId}/verify`, { code });
    return response.data;
  },

  reportDeliveryFailed: async (orderId: number, reason: string): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/delivery/${orderId}/report-failed`, { reason });
    return response.data;
  },
};
