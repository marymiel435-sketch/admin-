import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AccountStatus } from '../utils/constants';
import { AuthLoadState, AuthProvider, useAuthState } from './authContext';

// Lazy-loaded so an unauthenticated visitor hitting the public landing page
// only downloads its own chunk, not the dashboard/Firebase-heavy screens
// behind auth — those load on demand once actually navigated to.
const LoginScreen = lazy(() => import('../screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('../screens/auth/RegisterScreen'));
const CategoryListScreen = lazy(() => import('../screens/dashboard/categories/CategoryListScreen'));
const DashboardShell = lazy(() =>
  import('../screens/dashboard/DashboardShell').then((m) => ({ default: m.DashboardShell })),
);
const DevPreviewShell = lazy(() =>
  import('../screens/dashboard/DashboardShell').then((m) => ({ default: m.DevPreviewShell })),
);
const ProductFormScreen = lazy(() => import('../screens/dashboard/products/ProductFormScreen'));
const ProductListScreen = lazy(() => import('../screens/dashboard/products/ProductListScreen'));
const DevPreviewProductList = lazy(() =>
  import('../screens/dashboard/products/ProductListScreen').then((m) => ({ default: m.DevPreviewProductList })),
);
const StoreProfileScreen = lazy(() => import('../screens/dashboard/profile/StoreProfileScreen'));
const PendingReviewScreen = lazy(() => import('../screens/onboarding/PendingReviewScreen'));
const RejectedScreen = lazy(() => import('../screens/onboarding/RejectedScreen'));
const SuspendedScreen = lazy(() => import('../screens/onboarding/SuspendedScreen'));
const SubscriptionScreen = lazy(() => import('../screens/subscription/SubscriptionScreen'));

function RouteFallback() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}

const PUBLIC_ROUTES = new Set(['/login', '/register', '/dev-preview']);

// Hard-gate screens an approved, good-standing owner should never be able
// to sit on — always bounced back to `/`. `/subscription` is deliberately
// NOT in this set: unlike these, it's also meant to be voluntarily
// reachable (dashboard sidebar / "Subscribe now" banner) even when the
// owner isn't currently gated. The separate subscriptionGateActive check
// below still force-redirects there when the owner *is* gated.
const GATE_ROUTES = new Set(['/pending', '/rejected', '/suspended']);

function computeRedirect(auth, loc) {
  // Still resolving initial auth state (before authStateChanges() fires its
  // first event) — AuthGate renders a bare spinner in place instead of
  // redirecting anywhere, so there's nothing to compute yet.
  if (auth.authState === AuthLoadState.loading) return null;

  if (auth.authState === AuthLoadState.unauthenticated) {
    return PUBLIC_ROUTES.has(loc) ? null : '/login';
  }

  // Authenticated, but the store doc hasn't streamed in yet — don't
  // redirect, to avoid flashing /login or /pending before we know status.
  if (!auth.storeLoaded) return null;

  // Authenticated with no store doc (edge case: auth user created but the
  // registration write failed) — send back to register to retry.
  // /login is allowed too: LoginScreen checks for the store doc itself and
  // signs the user back out with a message, instead of this silently
  // bouncing them to the registration form (and trapping them there).
  if (auth.store == null) {
    return loc === '/register' || loc === '/login' ? null : '/register';
  }

  const status = auth.store.accountStatus;
  if (status !== AccountStatus.approved) {
    let gateTarget;
    switch (status) {
      case AccountStatus.pending:
        gateTarget = '/pending';
        break;
      case AccountStatus.rejected:
        gateTarget = '/rejected';
        break;
      case AccountStatus.suspended:
        gateTarget = '/suspended';
        break;
      default:
        gateTarget = '/pending'; // unknown/legacy value: fail safe to blocked
    }
    return loc === gateTarget ? null : gateTarget;
  }

  // Approved, but the maintenance-subscription trial ran out (or a paid
  // period lapsed) with no payment awaiting review — block the dashboard
  // until the owner submits proof of payment.
  if (auth.store.subscriptionGateActive) {
    return loc === '/subscription' ? null : '/subscription';
  }

  // Approved and in good standing: keep the owner out of auth/gate screens.
  if (PUBLIC_ROUTES.has(loc) || GATE_ROUTES.has(loc)) {
    return '/';
  }
  return null;
}

function AuthGate() {
  const auth = useAuthState();
  const location = useLocation();

  // Resolving the initial Firebase auth check — render a bare spinner in
  // place rather than redirecting to any particular route, so there's
  // nothing to flash-then-correct once the real state comes in.
  if (auth.authState === AuthLoadState.loading) {
    return <RouteFallback />;
  }

  const target = computeRedirect(auth, location.pathname);
  if (target != null && target !== location.pathname) {
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

function NotFoundScreen() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      Page not found
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthGate />}>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route
          path="/dev-preview"
          element={
            <DevPreviewShell>
              <DevPreviewProductList />
            </DevPreviewShell>
          }
        />
        <Route path="/pending" element={<PendingReviewScreen />} />
        <Route path="/rejected" element={<RejectedScreen />} />
        <Route path="/suspended" element={<SuspendedScreen />} />
        <Route element={<DashboardShell />}>
          <Route path="/" element={<ProductListScreen />} />
          <Route path="/products/new" element={<ProductFormScreen />} />
          <Route path="/products/:id/edit" element={<ProductFormScreen />} />
          <Route path="/profile" element={<StoreProfileScreen />} />
          <Route path="/categories" element={<CategoryListScreen />} />
          {/* Nested in the shell (not a standalone route) so the sidebar/topbar
              stay visible when reached voluntarily, same as every other
              dashboard page — the hard-gate redirect above still lands here
              just fine since it targets the path, not a particular route tree. */}
          <Route path="/subscription" element={<SubscriptionScreen />} />
        </Route>
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
