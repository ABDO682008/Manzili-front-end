import axiosInstance from './axiosInstance';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, RefreshResponse } from '../types';

export const authApi = {
  // POST /auth/login - Response includes role as STRING ("Buyer" | "Provider" | "Admin")
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  // POST /auth/register - role is NUMBER: 1=Buyer, 2=Seller(Provider), 3=Admin
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>('/auth/register', data);
    return response.data;
  },

  // POST /auth/refresh
  refresh: async (refreshToken: string): Promise<ApiResponse<RefreshResponse>> => {
    const response = await axiosInstance.post<ApiResponse<RefreshResponse>>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
