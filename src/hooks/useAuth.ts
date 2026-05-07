import { useAuthStore } from '../stores';

export const useAuth = () => {
  const { user, isAuthenticated, role, setAuth, clearAuth } = useAuthStore();

  const updateUser = (_updates: Partial<typeof user>) => {
    if (!user) return;
  };

  return {
    user,
    isAuthenticated,
    role,
    isBuyer: role === 'Buyer',
    isSeller: role === 'Seller',
    isAdmin: role === 'Admin',
    isDeliveryAgent: role === 'DeliveryAgent',
    setAuth,
    clearAuth,
    updateUser,
  };
};
