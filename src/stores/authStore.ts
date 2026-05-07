import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UIRole, APIRole } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UIRole | null;
  setAuth: (accessToken: string, refreshToken: string, apiRole: APIRole) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

const mapRole = (apiRole: string): UIRole => {
  if (apiRole === 'Provider') return 'Seller';
  if (apiRole === 'Admin') return 'Admin';
  if (apiRole === 'DeliveryAgent') return 'DeliveryAgent';
  return 'Buyer';
};

const decodeJwt = (token: string): Record<string, unknown> => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,

      setAuth: (accessToken, refreshToken, apiRole) => {
        const payload = decodeJwt(accessToken);
        const uiRole = mapRole(apiRole);
        const user: User = {
          id: (payload.sub as string) || '',
          email: (payload.email as string) || '',
          fullName: (payload.name as string) || (payload.fullName as string) || (payload.email as string) || '',
          uiRole,
        };
        set({ user, accessToken, refreshToken, isAuthenticated: true, role: uiRole });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          role: null,
        }),
    }),
    {
      name: 'manzili-auth',
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);
