export type NotificationType = 
  | 'RequestAccepted' 
  | 'RequestRejected' 
  | 'RequestRepriced'
  | 'PaymentApproved'
  | 'PaymentRejected'
  | 'OrderStatusChanged'
  | 'DeliveryCodeGenerated'
  | 'OrderCompleted'
  | 'AdminAnnouncement'
  | 'System';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
}
