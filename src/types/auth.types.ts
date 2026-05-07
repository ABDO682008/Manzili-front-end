// UI Role type - 'Provider' from API maps to 'Seller' in UI
export type UIRole = 'Buyer' | 'Seller' | 'Admin' | 'DeliveryAgent';
// API Role type - what the backend returns
export type APIRole = 'Buyer' | 'Provider' | 'Admin' | 'DeliveryAgent';

export interface User {
  id: string;  // From JWT sub claim
  email: string;
  fullName: string;
  uiRole: UIRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: APIRole;  // API returns role string
}

// Register: role is NUMBER (1=Buyer, 2=Seller/Provider, 3=Admin)
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 1 | 2 | 3;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
