import axiosInstance from './axiosInstance';
import type { ApiResponse, PaginatedResponse, Service, Transaction } from '../types';

export interface DashboardStats {
  totalUsers: number;
  activeSellers: number;
  ordersToday: number;
  revenueToday: number;
  pendingPayments: number;
  openDisputes: number;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  targetAudience: 'All' | 'Buyers' | 'Sellers' | 'VIPSellers';
  isActive: boolean;
  scheduledAt?: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  targetAudience: 'All' | 'Buyers' | 'Sellers' | 'VIPSellers';
  scheduledAt?: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data;
  },

  getServices: async (params?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Service>>>('/admin/services', { params });
    return response.data;
  },

  updateServiceStatus: async (id: number, status: 'Active' | 'Disabled'): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.patch<ApiResponse<Service>>(`/admin/services/${id}/status`, { status });
    return response.data;
  },

  featureService: async (id: number, featured: boolean): Promise<ApiResponse<Service>> => {
    const response = await axiosInstance.patch<ApiResponse<Service>>(`/admin/services/${id}/feature`, { featured });
    return response.data;
  },

  getOrders: async (params?: { status?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>('/admin/orders', { params });
    return response.data;
  },

  forceCancelOrder: async (id: number, reason: string): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/admin/orders/${id}/force-cancel`, { reason });
    return response.data;
  },

  forceCompleteOrder: async (id: number, reason: string): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(`/admin/orders/${id}/force-complete`, { reason });
    return response.data;
  },

  getFinancialTransactions: async (params?: { type?: string; status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Transaction>>>('/admin/transactions', { params });
    return response.data;
  },

  getAnnouncements: async (params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Announcement>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Announcement>>>('/admin/announcements', { params });
    return response.data;
  },

  createAnnouncement: async (data: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    const response = await axiosInstance.post<ApiResponse<Announcement>>('/admin/announcements', data);
    return response.data;
  },

  deleteAnnouncement: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/admin/announcements/${id}`);
    return response.data;
  },

  toggleAnnouncementStatus: async (id: number): Promise<ApiResponse<Announcement>> => {
    const response = await axiosInstance.patch<ApiResponse<Announcement>>(`/admin/announcements/${id}/status`);
    return response.data;
  },
};
