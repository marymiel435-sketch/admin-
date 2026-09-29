import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth, AuthStatus } from './context/AuthContext';
import AppProviders from './context/AppProviders';
import { AppColors } from './theme/colors';
import LoginScreen from './screens/auth/LoginScreen';
import StoreLoginScreen from './screens/auth/StoreLoginScreen';
import LandingScreen from './screens/landing/LandingScreen';
import DownloadScreen from './screens/landing/DownloadScreen';
import AdminLayout from './layout/AdminLayout';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import CustomersScreen from './screens/customers/CustomersScreen';
import CustomerDetailScreen from './screens/customers/CustomerDetailScreen';
import OrdersScreen from './screens/orders/OrdersScreen';
import OrderDetailScreen from './screens/orders/OrderDetailScreen';
import RidersScreen from './screens/riders/RidersScreen';
import RiderDetailScreen from './screens/riders/RiderDetailScreen';
import CreateRiderScreen from './screens/riders/CreateRiderScreen';
import EditRiderScreen from './screens/riders/EditRiderScreen';
import PendingApprovalsScreen from './screens/riders/PendingApprovalsScreen';
import OfficeVisitScreen from './screens/riders/OfficeVisitScreen';
import StoresScreen from './screens/stores/StoresScreen';
import StoreDetailScreen from './screens/stores/StoreDetailScreen';
import CreateStoreScreen from './screens/stores/CreateStoreScreen';
import PendingStoreApprovalsScreen from './screens/stores/PendingStoreApprovalsScreen';
import StoreProductsScreen from './screens/stores/StoreProductsScreen';
import SubscriptionReviewScreen from './screens/stores/SubscriptionReviewScreen';
import SosScreen from './screens/sos/SosScreen';
import LiveTrackingScreen from './screens/tracking/LiveTrackingScreen';
import SubscriptionsScreen from './screens/subscriptions/SubscriptionsScreen';
import SubscriptionSettingsScreen from './screens/subscriptions/SubscriptionSettingsScreen';
import ReportsScreen from './screens/reports/ReportsScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';

// Mirrors main.dart's _AuthWrapper — the single routing gate for the app.
function AuthWrapper() {
  const auth = useAuth();

  useEffect(() => {
    auth.tryRestoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (auth.status === AuthStatus.initial || auth.isRestoringSession) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: AppColors.primary }} />
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: AppColors.textSecondary }}>
          Vlue Rides
        </Typography>
      </Box>
    );
  }

  if (auth.status === AuthStatus.authenticated) {
    return (
      <AppProviders>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="customers" element={<CustomersScreen />} />
            <Route path="customers/:id" element={<CustomerDetailScreen />} />
            <Route path="orders" element={<OrdersScreen />} />
            <Route path="orders/:id" element={<OrderDetailScreen />} />
            <Route path="riders" element={<RidersScreen />} />
            <Route path="riders/new" element={<CreateRiderScreen />} />
            <Route path="riders/pending-approvals" element={<PendingApprovalsScreen />} />
            <Route path="riders/office-visit" element={<OfficeVisitScreen />} />
            <Route path="riders/:id" element={<RiderDetailScreen />} />
            <Route path="riders/:id/edit" element={<EditRiderScreen />} />
            <Route path="stores" element={<StoresScreen />} />
            <Route path="stores/new" element={<CreateStoreScreen />} />
            <Route path="stores/pending-approvals" element={<PendingStoreApprovalsScreen />} />
            <Route path="stores/subscription-reviews" element={<SubscriptionReviewScreen />} />
            <Route path="stores/:id" element={<StoreDetailScreen />} />
            <Route path="stores/:id/edit" element={<CreateStoreScreen />} />
            <Route path="stores/:id/products" element={<StoreProductsScreen />} />
            <Route path="sos" element={<SosScreen />} />
            <Route path="tracking" element={<LiveTrackingScreen />} />
            <Route path="subscriptions" element={<SubscriptionsScreen />} />
            <Route path="subscriptions/settings" element={<SubscriptionSettingsScreen />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AppProviders>
    );
  }

  // Covers: unauthenticated, error, and loading (during signIn) — LoginScreen
  // shows its own inline loading state, so no separate loading screen here.
  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/download" element={<DownloadScreen />} />
      <Route path="/login/admin" element={<LoginScreen />} />
      <Route path="/login/store" element={<StoreLoginScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}
