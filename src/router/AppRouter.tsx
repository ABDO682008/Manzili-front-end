import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BuyerLayout, SellerLayout, AdminLayout, AuthLayout, DeliveryLayout } from '../components/layout';
import { BuyerGuard, SellerGuard, AdminGuard, DeliveryGuard, PublicOnlyGuard } from '../guards/RoleGuard';
import { PageSpinner } from '../components/common';

// Auth pages
const SignInPage = lazy(() => import('../pages/auth/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage').then(m => ({ default: m.SignUpPage })));

// Buyer pages
const HomePage = lazy(() => import('../pages/buyer/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('../pages/buyer/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetailsPage = lazy(() => import('../pages/buyer/ServiceDetailsPage').then(m => ({ default: m.ServiceDetailsPage })));
const RequestsPage = lazy(() => import('../pages/buyer/RequestsPage').then(m => ({ default: m.RequestsPage })));
const RequestConfirmationPage = lazy(() => import('../pages/buyer/RequestConfirmationPage').then(m => ({ default: m.RequestConfirmationPage })));
const PaymentSummaryPage = lazy(() => import('../pages/buyer/PaymentSummaryPage').then(m => ({ default: m.PaymentSummaryPage })));
const PaymentMethodPage = lazy(() => import('../pages/buyer/PaymentMethodPage').then(m => ({ default: m.PaymentMethodPage })));
const PaymentProcessingPage = lazy(() => import('../pages/buyer/PaymentProcessingPage').then(m => ({ default: m.PaymentProcessingPage })));
const PaymentSuccessPage = lazy(() => import('../pages/buyer/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const OrdersPage = lazy(() => import('../pages/buyer/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderDetailsPage = lazy(() => import('../pages/buyer/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })));
const FavoritesPage = lazy(() => import('../pages/buyer/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const NotificationsPage = lazy(() => import('../pages/buyer/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('../pages/buyer/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AccountPage = lazy(() => import('../pages/buyer/AccountPage').then(m => ({ default: m.AccountPage })));
const CartPage = lazy(() => import('../pages/buyer/CartPage').then(m => ({ default: m.CartPage })));

// Seller pages
const SellerDashboardPage = lazy(() => import('../pages/seller/SellerDashboardPage').then(m => ({ default: m.SellerDashboardPage })));
const MyServicesPage = lazy(() => import('../pages/seller/MyServicesPage').then(m => ({ default: m.MyServicesPage })));
const CreateServicePage = lazy(() => import('../pages/seller/CreateServicePage').then(m => ({ default: m.CreateServicePage })));
const UpdateServicePage = lazy(() => import('../pages/seller/UpdateServicePage').then(m => ({ default: m.UpdateServicePage })));
const ManageOrdersPage = lazy(() => import('../pages/seller/ManageOrdersPage').then(m => ({ default: m.ManageOrdersPage })));
const SellerOrderDetailsPage = lazy(() => import('../pages/seller/SellerOrderDetailsPage').then(m => ({ default: m.SellerOrderDetailsPage })));
const SellerDiscountsPage = lazy(() => import('../pages/seller/SellerDiscountsPage').then(m => ({ default: m.SellerDiscountsPage })));
const SellerEarningsPage = lazy(() => import('../pages/seller/SellerEarningsPage').then(m => ({ default: m.SellerEarningsPage })));

// Admin pages
const AdminHubPage = lazy(() => import('../pages/admin/AdminHubPage').then(m => ({ default: m.AdminHubPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage').then(m => ({ default: m.AdminServicesPage })));
const AdminTransactionsPage = lazy(() => import('../pages/admin/AdminTransactionsPage').then(m => ({ default: m.AdminTransactionsPage })));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailsPage = lazy(() => import('../pages/admin/AdminOrderDetailsPage').then(m => ({ default: m.AdminOrderDetailsPage })));
const AdminAnnouncementsPage = lazy(() => import('../pages/admin/AdminAnnouncementsPage').then(m => ({ default: m.AdminAnnouncementsPage })));

// Delivery pages
const DeliveryHomePage = lazy(() => import('../pages/delivery/DeliveryHomePage').then(m => ({ default: m.DeliveryHomePage })));
const AvailableDeliveriesPage = lazy(() => import('../pages/delivery/AvailableDeliveriesPage').then(m => ({ default: m.AvailableDeliveriesPage })));
const MyDeliveriesPage = lazy(() => import('../pages/delivery/MyDeliveriesPage').then(m => ({ default: m.MyDeliveriesPage })));
const DeliveryVerifyPage = lazy(() => import('../pages/delivery/DeliveryVerifyPage').then(m => ({ default: m.DeliveryVerifyPage })));

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-surface-900 mb-2">{title}</h1>
    <p className="text-surface-400">This page is coming soon.</p>
  </div>
);

export const AppRouter = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1a1a2e',
            borderRadius: '14px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' }, duration: 5000 },
        }}
      />

      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicOnlyGuard><AuthLayout /></PublicOnlyGuard>}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* Buyer Routes */}
          <Route element={<BuyerGuard><BuyerLayout /></BuyerGuard>}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/confirmation" element={<RequestConfirmationPage />} />
            <Route path="/payment/summary" element={<PaymentSummaryPage />} />
            <Route path="/payment/method" element={<PaymentMethodPage />} />
            <Route path="/payment/processing" element={<PaymentProcessingPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/vip" element={<PlaceholderPage title="VIP Plans — Coming Soon" />} />
          </Route>

          {/* Seller Routes */}
          <Route element={<SellerGuard><SellerLayout /></SellerGuard>}>
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/services" element={<MyServicesPage />} />
            <Route path="/seller/services/create" element={<CreateServicePage />} />
            <Route path="/seller/services/:id/edit" element={<UpdateServicePage />} />
            <Route path="/seller/orders" element={<ManageOrdersPage />} />
            <Route path="/seller/orders/:id" element={<SellerOrderDetailsPage />} />
            <Route path="/seller/discounts" element={<SellerDiscountsPage />} />
            <Route path="/seller/earnings" element={<SellerEarningsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route path="/admin/hub" element={<AdminHubPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id" element={<PlaceholderPage title="User Details" />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/services/:id" element={<PlaceholderPage title="Service Details - Coming Soon" />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin/transactions/:id" element={<PlaceholderPage title="Transaction Details" />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          </Route>

          {/* Delivery Routes */}
          <Route element={<DeliveryGuard><DeliveryLayout /></DeliveryGuard>}>
            <Route path="/delivery" element={<DeliveryHomePage />} />
            <Route path="/delivery/available" element={<AvailableDeliveriesPage />} />
            <Route path="/delivery/my-deliveries" element={<MyDeliveriesPage />} />
            <Route path="/delivery/:orderId" element={<PlaceholderPage title="Delivery Details" />} />
            <Route path="/delivery/:orderId/verify" element={<DeliveryVerifyPage />} />
            <Route path="/delivery/success" element={<PlaceholderPage title="Delivery Success" />} />
            <Route path="/delivery/failed" element={<PlaceholderPage title="Delivery Failed" />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<PlaceholderPage title="404 — Page Not Found" />} />
        </Routes>
      </Suspense>
    </>
  );
};
