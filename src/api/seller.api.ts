import axiosInstance from './axiosInstance';

export interface SellerDashboardStats {
  totalServices: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
}

export interface SellerServiceItem {
  Id: number;
  Title: string;
  Image: string;
  Category: string;
  Rating: number;
  OrdersCount: number;
  Status: 'Active' | 'Paused' | 'Draft';
  BasePrice: number;
  CreatedAt: string;
}

export interface CreateSellerServiceData {
  title: string;
  description: string;
  categoryId: number;
  basePrice: number;
  images: File[];
  optionGroups?: Array<{
    name: string;
    isRequired: boolean;
    allowMultiple: boolean;
    options: Array<{ name: string; price: number }>;
  }>;
}

const normalize = <T>(body: any): { success: boolean; data: T | null; message?: string } => {
  if (!body) return { success: false, data: null };
  if ('success' in body && 'data' in body) return body;
  if ('success' in body) return { success: !!body.success, data: body as T, message: body.message };
  return { success: true, data: body as T };
};

export const sellerApi = {
  getDashboard: async () => {
    const res = await axiosInstance.get('/seller/dashboard');
    return normalize<SellerDashboardStats>(res.data);
  },

  getServices: async (params: { Status?: string; Page?: number; PageSize?: number } = {}) => {
    const res = await axiosInstance.get('/seller/services', { params });
    return normalize<{ Items: SellerServiceItem[] }>(res.data);
  },

  getServiceById: async (id: number) => {
    const res = await axiosInstance.get(`/seller/services/${id}`);
    return normalize<SellerServiceItem>(res.data);
  },

  createService: async (data: CreateSellerServiceData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('categoryId', String(data.categoryId));
    formData.append('basePrice', String(data.basePrice));

    if (data.optionGroups) {
      data.optionGroups.forEach((group, gi) => {
        formData.append(`optionGroups[${gi}].name`, group.name);
        formData.append(`optionGroups[${gi}].isRequired`, String(group.isRequired));
        formData.append(`optionGroups[${gi}].allowMultiple`, String(group.allowMultiple));
        group.options.forEach((opt, oi) => {
          formData.append(`optionGroups[${gi}].options[${oi}].name`, opt.name);
          formData.append(`optionGroups[${gi}].options[${oi}].price`, String(opt.price));
        });
      });
    }

    data.images.forEach((img) => formData.append('images', img));

    const res = await axiosInstance.post('/seller/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalize<SellerServiceItem>(res.data);
  },

  updateService: async (id: number, data: Partial<CreateSellerServiceData>) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    if (data.basePrice) formData.append('basePrice', String(data.basePrice));
    if (data.images?.length) data.images.forEach((img) => formData.append('images', img));

    const res = await axiosInstance.put(`/seller/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalize<SellerServiceItem>(res.data);
  },

  deleteService: async (id: number) => {
    const res = await axiosInstance.delete(`/seller/services/${id}`);
    return normalize<void>(res.data);
  },

  toggleServiceStatus: async (id: number) => {
    const res = await axiosInstance.patch(`/seller/services/${id}/toggle-status`);
    return normalize<{ Status: string }>(res.data);
  },
};
