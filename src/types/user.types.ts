export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'Buyer' | 'Seller' | 'Admin' | 'DeliveryAgent';
  isVIP: boolean;
  createdAt: string;
  stats?: UserStats;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  totalSales?: number;
  averageRating?: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}
