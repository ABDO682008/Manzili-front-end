export interface Discount {
  id: number;
  code: string;
  type: 'Percentage' | 'FixedAmount';
  value: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  minPurchaseAmount?: number;
  isActive: boolean;
  sellerId: number;
}

export interface CreateDiscountRequest {
  code: string;
  type: 'Percentage' | 'FixedAmount';
  value: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  minPurchaseAmount?: number;
}
