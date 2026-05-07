import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'Buyer' | 'Seller' | 'Admin' | 'DeliveryAgent'>;
  fallback?: string;
}

const defaultRoutes: Record<string, string> = {
  Buyer: '/home',
  Seller: '/seller/dashboard',
  Admin: '/admin/hub',
  DeliveryAgent: '/delivery',
};

export const RoleGuard = ({ children, allowedRoles, fallback }: RoleGuardProps) => {
  const { isAuthenticated, role, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  const userRole = role || user?.uiRole;

  if (!userRole || !allowedRoles.includes(userRole)) {
    const redirectPath = fallback || (userRole ? defaultRoutes[userRole] : '/signin');
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export const BuyerGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={['Buyer']}>{children}</RoleGuard>
);

export const SellerGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={['Seller']}>{children}</RoleGuard>
);

export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={['Admin']}>{children}</RoleGuard>
);

export const DeliveryGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={['DeliveryAgent']}>{children}</RoleGuard>
);

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

export const PublicOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role, user } = useAuthStore();
  const userRole = role || user?.uiRole;
  if (isAuthenticated && userRole) {
    return <Navigate to={defaultRoutes[userRole] || '/home'} replace />;
  }
  return <>{children}</>;
};
