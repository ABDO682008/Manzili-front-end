import axiosInstance from './axiosInstance';
import type { ApiResponse, Payment, CreatePaymentRequest, PaymentAccount, PaginatedResponse } from '../types';

export const paymentsApi = {
  createPayment: async (data: CreatePaymentRequest): Promise<ApiResponse<Payment>> => {
    const formData = new FormData();
    formData.append('requestIds', JSON.stringify(data.requestIds));
    formData.append('method', data.method);
    formData.append('proofImage', data.proofImage);
    formData.append('totalAmount', data.totalAmount.toString());
    if (data.note) formData.append('note', data.note);

    const response = await axiosInstance.post<ApiResponse<Payment>>('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPaymentStatus: async (id: number): Promise<ApiResponse<Payment>> => {
    const response = await axiosInstance.get<ApiResponse<Payment>>(`/payments/${id}/status`);
    return response.data;
  },

  getPaymentAccounts: async (): Promise<ApiResponse<PaymentAccount[]>> => {
    const response = await axiosInstance.get<ApiResponse<PaymentAccount[]>>('/payments/accounts');
    return response.data;
  },

  getPendingPayments: async (params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Payment>>>('/admin/payments/pending', { params });
    return response.data;
  },

  approvePayment: async (id: number): Promise<ApiResponse<Payment>> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(`/admin/payments/${id}/approve`);
    return response.data;
  },

  rejectPayment: async (id: number, reason: string): Promise<ApiResponse<Payment>> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(`/admin/payments/${id}/reject`, { reason });
    return response.data;
  },
};
