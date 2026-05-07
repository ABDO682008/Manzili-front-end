import axiosInstance from './axiosInstance';
import type { ApiResponse, Notification, PaginatedResponse, NotificationFilter } from '../types';

export const notificationsApi = {
  getNotifications: async (params?: NotificationFilter & { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await axiosInstance.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.patch<ApiResponse<void>>('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },
};
