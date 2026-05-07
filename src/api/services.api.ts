import axiosInstance from './axiosInstance';

export interface HomeSectionItem {
  id: number;
  title: string;
  providerName: string;
  basePrice: number;
  rating: number;
  imageUrl: string;
}

export interface HomeSectionsResponse {
  topDiscounts: HomeSectionItem[];
  recommended: HomeSectionItem[];
  mostPurchased: HomeSectionItem[];
  regular: HomeSectionItem[];
}

export interface SearchServiceItem {
  id: number;
  title: string;
  basePrice: number;
  providerName: string;
  thumbnailImageUrl: string;
}

export interface ServiceDetail {
  id: number;
  title: string;
  serviceDescription: string;
  basePrice: number;
  address: string;
  provider: {
    id: number;
    fullName: string;
    rating: number;
    reviewsNo: number;
  };
  optionGroups: Array<{
    id: number;
    name: string;
    isRequired: boolean;
    allowMultiple: boolean;
    options: Array<{
      id: number;
      name: string;
      priceAdjustment: number;
    }>;
  }>;
  images: Array<{
    id: number;
    imageUrl: string;
  }>;
}

// Normalizes any API response shape to {success, data}
const normalize = <T>(body: any): { success: boolean; data: T | null; message?: string } => {
  if (!body) return { success: false, data: null };
  if ('success' in body && 'data' in body) return body;
  if ('success' in body) return { success: !!body.success, data: body as T, message: body.message };
  return { success: true, data: body as T };
};

export const servicesApi = {
  getHomeSections: async (no = 4) => {
    const res = await axiosInstance.get(`/services/home/${no}`);
    return normalize<HomeSectionsResponse>(res.data);
  },

  getServices: async (params: {
    page?: number;
    pageSize?: number;
    categoryId?: number;
    isRecommended?: boolean;
    topDiscounts?: boolean;
    mostPurchased?: boolean;
  }) => {
    const res = await axiosInstance.get('/services', { params });
    return normalize<{ items: HomeSectionItem[]; totalPages: number; page: number; pageSize: number }>(res.data);
  },

  searchServices: async (name: string, pageNumber = 1, pageSize = 10) => {
    const res = await axiosInstance.get(`/services/name/${encodeURIComponent(name)}`, {
      params: { pageNumber, pageSize },
    });
    return normalize<{ items: SearchServiceItem[] }>(res.data);
  },

  getServiceById: async (id: number) => {
    const res = await axiosInstance.get(`/services/${id}`);
    return normalize<ServiceDetail>(res.data);
  },
};
