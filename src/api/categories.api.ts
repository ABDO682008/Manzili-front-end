import axiosInstance from './axiosInstance';

export interface Category {
  id: number;
  slug: string;
  nameAr: string;
  isActive: boolean;
  sortOrder: number;
}

const normalize = <T>(body: any): { success: boolean; data: T | null } => {
  if (!body) return { success: false, data: null };
  if ('success' in body && 'data' in body) return body;
  return { success: true, data: body as T };
};

export const categoriesApi = {
  getCategories: async () => {
    const res = await axiosInstance.get('/categories');
    return normalize<{ items: Category[] }>(res.data);
  },
};
