import axiosInstance from './axiosInstance';
import type { ApiResponse, Transaction, PaginatedResponse, TransactionType, RepriceRequest, RejectRequest, CancelRequest } from '../types';

export const transactionsApi = {
  getTransactions: async (params: {
    role: 'buyer' | 'seller' | 'admin';
    status?: TransactionType | TransactionType[];
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data;
  },

  acceptRequest: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/seller/orders/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: number, data: RejectRequest): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/seller/orders/${id}/reject`, data);
    return response.data;
  },

  repriceRequest: async (id: number, data: RepriceRequest): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/seller/orders/${id}/reprice`, data);
    return response.data;
  },

  acceptReprice: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.patch<ApiResponse<Transaction>>(`/transactions/${id}/accept-price`);
    return response.data;
  },

  rejectReprice: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.patch<ApiResponse<Transaction>>(`/transactions/${id}/reject-price`);
    return response.data;
  },

  startWorking: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.patch<ApiResponse<Transaction>>(`/seller/orders/${id}/status`, { status: 'InProgress' });
    return response.data;
  },

  markReadyForShipping: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.patch<ApiResponse<Transaction>>(`/seller/orders/${id}/status`, { status: 'ReadyForShipping' });
    return response.data;
  },

  cancelByBuyer: async (id: number, data?: CancelRequest): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.patch<ApiResponse<Transaction>>(`/transactions/${id}/cancel`, data);
    return response.data;
  },

  cancelBySeller: async (id: number, data: CancelRequest): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/seller/orders/${id}/cancel`, data);
    return response.data;
  },

  getDeliveryCode: async (id: number): Promise<ApiResponse<{ code: string; expiry: string }>> => {
    const response = await axiosInstance.get<ApiResponse<{ code: string; expiry: string }>>(`/transactions/${id}/delivery-code`);
    return response.data;
  },
};
