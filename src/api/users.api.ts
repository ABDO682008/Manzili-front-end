import axiosInstance from './axiosInstance';
import type { ApiResponse, UserProfile, UpdateProfileRequest, ChangePasswordRequest, PaginatedResponse, User } from '../types';

export const usersApi = {
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.put<ApiResponse<UserProfile>>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post<ApiResponse<{ avatarUrl: string }>>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.patch<ApiResponse<void>>('/users/me/password', data);
    return response.data;
  },

  deleteAccount: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>('/users/me');
    return response.data;
  },

  getUsers: async (params: { search?: string; role?: string; status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<UserProfile>> => {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: number, status: 'Active' | 'Suspended' | 'Banned', reason: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status, reason });
    return response.data;
  },
};
