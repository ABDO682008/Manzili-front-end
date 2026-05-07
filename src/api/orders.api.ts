import axiosInstance from './axiosInstance';

export interface OrderItemOption {
  Name: string;
  Quantity: number;
  Price: number;
}

export interface PaymentSummaryService {
  OrderId: number;
  Image: string;
  Title: string;
  Quantity: number;
  Price: number;
  Options: OrderItemOption[];
}

export interface PaymentSummaryAddress {
  AddressPreview: string;
  Phone: string;
}

export interface PaymentSummaryPriceBreakdown {
  Subtotal: number;
  DeliveryFees: number;
  Total: number;
}

export interface PaymentSummaryResponse {
  Services: PaymentSummaryService[];
  Address: PaymentSummaryAddress;
  PriceBreakdown: PaymentSummaryPriceBreakdown;
}

export interface OrderItem {
  id: number;
  serviceName: string;
  customizationDetails: string;
  totalPrice: number;
  status: string;
  providerName: string;
  createdAt: string;
  options: Array<{
    groupOption: string;
    option: string;
    quantity: number;
  }>;
}

export interface RequestServiceData {
  serviceId: number;
  customizationText: string;
  customRequestImage?: string;
  quantity: number;
  optionGroups: Array<{
    groupId: number;
    items: Array<{
      optionId: number;
      quantity: number;
    }>;
  }>;
}

export interface RequestServiceResponse {
  requestId: string;
  totalPrice: number;
  requestDate: string;
}

export interface SubmitPaymentData {
  OrderIds: number[];
  PaymentScreenshot: string;
  Notes: string | null;
}

export interface SubmitPaymentResponse {
  OrderNo: string;
  PaymentDate: string;
  Total: number;
}

const normalize = <T>(body: any): { success: boolean; data: T | null; message?: string } => {
  if (!body) return { success: false, data: null };
  if ('success' in body && 'data' in body) return body;
  if ('success' in body) return { success: !!body.success, data: body as T, message: body.message };
  return { success: true, data: body as T };
};

export const ordersApi = {
  requestService: async (data: RequestServiceData) => {
    const res = await axiosInstance.post('/orders/request', data);
    return normalize<RequestServiceResponse>(res.data);
  },

  getOrders: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const res = await axiosInstance.get('/orders', { params });
    return normalize<{ items: OrderItem[]; page: number; pageSize: number; totalPages: number }>(res.data);
  },

  getPaymentSummary: async () => {
    const res = await axiosInstance.get('/order/payment-summary');
    return normalize<PaymentSummaryResponse>(res.data);
  },

  submitPayment: async (data: SubmitPaymentData) => {
    const res = await axiosInstance.post('/orders/submit-payment', data);
    return normalize<SubmitPaymentResponse>(res.data);
  },
};
