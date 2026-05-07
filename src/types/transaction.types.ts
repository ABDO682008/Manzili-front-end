export type TransactionType =
  | 'Cart'
  | 'Request'
  | 'RePriced'
  | 'AcceptedPrice'
  | 'Accepted'
  | 'PaymentFailed'
  | 'Paid'
  | 'InProgress'
  | 'ReadyForShipping'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Completed'
  | 'CancelledByBuyer'
  | 'CancelledBySeller'
  | 'Rejected'
  | 'Expired'
  | 'EscrowPayment'
  | 'PlatformCommission'
  | 'SellerPayout'
  | 'RefundedEscrowPayment';

export interface Transaction {
  id: number;
  type: TransactionType;
  status: TransactionType;
  serviceId: number;
  serviceTitle: string;
  serviceImage?: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  originalPrice: number;
  proposedPrice?: number;
  finalPrice: number;
  quantity: number;
  notes?: string;
  options?: Record<string, string>;
  deliveryCode?: string;
  deliveryCodeExpiry?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  repriceReason?: string;
  rejectReason?: string;
  cancelReason?: string;
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  status: TransactionType;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface CartItem {
  id: number;
  serviceId: number;
  serviceTitle: string;
  serviceImage?: string;
  sellerId: number;
  sellerName: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
  notes?: string;
}

export interface CreateRequestRequest {
  cartItemIds: number[];
}

export interface RepriceRequest {
  proposedPrice: number;
  reason: string;
}

export interface RejectRequest {
  reason: string;
}

export interface CancelRequest {
  reason?: string;
}

export const STATUS_LABELS: Record<TransactionType, { ar: string; en: string; color: string }> = {
  Cart: { ar: 'في السلة', en: 'In Cart', color: 'gray' },
  Request: { ar: 'طلب مُرسَل', en: 'Request Sent', color: 'blue' },
  RePriced: { ar: 'تم تعديل السعر', en: 'Price Updated', color: 'amber' },
  AcceptedPrice: { ar: 'تم قبول السعر', en: 'Price Accepted', color: 'teal' },
  Accepted: { ar: 'تم القبول', en: 'Accepted', color: 'teal' },
  PaymentFailed: { ar: 'فشل الدفع', en: 'Payment Failed', color: 'red' },
  Paid: { ar: 'تم الدفع', en: 'Paid', color: 'green' },
  InProgress: { ar: 'جاري التنفيذ', en: 'In Progress', color: 'blue' },
  ReadyForShipping: { ar: 'جاهز للتسليم', en: 'Ready for Delivery', color: 'purple' },
  OutForDelivery: { ar: 'في الطريق', en: 'Out for Delivery', color: 'indigo' },
  Delivered: { ar: 'تم التسليم', en: 'Delivered', color: 'green' },
  Completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
  CancelledByBuyer: { ar: 'ملغي من المشتري', en: 'Cancelled by Buyer', color: 'red' },
  CancelledBySeller: { ar: 'ملغي من البائع', en: 'Cancelled by Seller', color: 'red' },
  Rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  Expired: { ar: 'منتهي الصلاحية', en: 'Expired', color: 'gray' },
  EscrowPayment: { ar: 'دفع الضمان', en: 'Escrow Payment', color: 'gray' },
  PlatformCommission: { ar: 'عمولة المنصة', en: 'Platform Commission', color: 'gray' },
  SellerPayout: { ar: 'دفع للبائع', en: 'Seller Payout', color: 'gray' },
  RefundedEscrowPayment: { ar: 'استرداد مبلغ', en: 'Refunded Payment', color: 'gray' },
};
