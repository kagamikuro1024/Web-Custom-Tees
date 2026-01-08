import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingFallback from './components/LoadingFallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// ⚡ LAZY LOADING - Code Splitting để giảm tải ban đầu
// Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CustomizePage = lazy(() => import('./pages/CustomizePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CustomizerPage = lazy(() => import('./pages/CustomizerPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

// User Protected Pages
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const DashboardPage = lazy(() => import('./pages/user/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductCreate = lazy(() => import('./pages/admin/AdminProductCreate'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="customize" element={<CustomizePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="customize/:slug" element={<CustomizerPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />

          {/* Protected User Routes */}
          <Route path="checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          {/* Order success - both with and without orderNumber param */}
          <Route path="order-success/:orderNumber?" element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="orders/:orderNumber" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Use separate AdminLayout */}
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/create" element={<AdminProductCreate />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="customers" element={<CustomersPage />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
