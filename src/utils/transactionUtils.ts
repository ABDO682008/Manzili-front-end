import { STATUS_LABELS } from '../types';
import type { TransactionType } from '../types';

export const getStatusLabel = (status: TransactionType, showArabic: boolean = true): string => {
  const label = STATUS_LABELS[status];
  if (!label) return status;
  return showArabic ? `${label.en} / ${label.ar}` : label.en;
};

export const getStatusColor = (status: TransactionType): string => {
  const label = STATUS_LABELS[status];
  return label?.color || 'gray';
};

export const getBuyerAllowedActions = (status: TransactionType): string[] => {
  switch (status) {
    case 'Cart':
      return ['submit_request'];
    case 'RePriced':
      return ['accept_price', 'reject_price'];
    case 'Accepted':
    case 'AcceptedPrice':
      return ['pay'];
    case 'Paid':
      return ['cancel'];
    case 'InProgress':
      return ['cancel'];
    default:
      return [];
  }
};

export const getSellerAllowedActions = (status: TransactionType): string[] => {
  switch (status) {
    case 'Request':
      return ['accept', 'reprice', 'reject'];
    case 'Paid':
      return ['start_working'];
    case 'InProgress':
      return ['mark_ready', 'cancel'];
    default:
      return [];
  }
};

export const getCancellationFeeInfo = (status: TransactionType): { charge: string; refund: string } | null => {
  switch (status) {
    case 'Paid':
      return { charge: '10-20%', refund: '80-90%' };
    case 'InProgress':
      return { charge: '25-50%', refund: '50-75%' };
    case 'ReadyForShipping':
      return { charge: '50-75%', refund: '25-50%' };
    default:
      return null;
  }
};

export const isOrderActive = (status: TransactionType): boolean => {
  return ['Paid', 'InProgress', 'ReadyForShipping', 'OutForDelivery', 'Delivered'].includes(status);
};

export const isOrderCompleted = (status: TransactionType): boolean => {
  return status === 'Completed';
};

export const isOrderCancelled = (status: TransactionType): boolean => {
  return ['CancelledByBuyer', 'CancelledBySeller', 'Rejected', 'Expired'].includes(status);
};

export const getOrderTimeline = (status: TransactionType): { label: string; completed: boolean; current: boolean }[] => {
  const steps = [
    { status: 'Paid', label: 'Payment Confirmed' },
    { status: 'InProgress', label: 'In Progress' },
    { status: 'ReadyForShipping', label: 'Ready for Delivery' },
    { status: 'OutForDelivery', label: 'Out for Delivery' },
    { status: 'Delivered', label: 'Delivered' },
    { status: 'Completed', label: 'Completed' },
  ];

  const currentIndex = steps.findIndex(s => s.status === status);
  
  return steps.map((step, index) => ({
    label: step.label,
    completed: currentIndex > index || status === 'Completed',
    current: step.status === status,
  }));
};
