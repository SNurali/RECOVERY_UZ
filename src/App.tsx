import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts - загружаем сразу, т.к. они нужны часто
import { StaffLayout } from './layouts/StaffLayout';
import { ClientLayout } from './layouts/ClientLayout';

// Lazy-loaded components
const GuestView = lazy(() => import('./components/GuestView'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Staff pages - lazy load
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffOrders = lazy(() => import('./pages/staff/Orders'));
const StaffOrderDetail = lazy(() => import('./pages/staff/OrderDetail'));
const Catalog = lazy(() => import('./pages/staff/Catalog'));
const Clients = lazy(() => import('./pages/staff/Clients'));
const Users = lazy(() => import('./pages/staff/Users'));

// Client pages - lazy load
const ClientHome = lazy(() => import('./pages/client/Home'));
const ClientNewOrder = lazy(() => import('./pages/client/NewOrder'));
const ClientOrderDetail = lazy(() => import('./pages/client/OrderDetail'));

// Loading component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    color: '#94a3b8' 
  }}>
    <div>Загрузка...</div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'client') return <Navigate to="/client" replace />;
    return <Navigate to="/staff" replace />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    if (user.role === 'client') return <Navigate to="/client" replace />;
    return <Navigate to="/staff" replace />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

const HomePage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Suspense fallback={<PageLoader />}><GuestView /></Suspense>;
  }

  if (user.role === 'client') {
    return <Navigate to="/client" replace />;
  }

  return <Navigate to="/staff" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      <Route path="/track" element={<TrackOrderPage />} />

      {/* Staff Routes */}
      <Route 
        path="/staff" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'operator', 'master']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="orders" element={<StaffOrders />} />
        <Route path="orders/:id" element={<StaffOrderDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Client Routes */}
      <Route 
        path="/client" 
        element={
          <ProtectedRoute allowedRoles={['client', 'admin']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientHome />} />
        <Route path="new-order" element={<ClientNewOrder />} />
        <Route path="orders/:id" element={<ClientOrderDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
