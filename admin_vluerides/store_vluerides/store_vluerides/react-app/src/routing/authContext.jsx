import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { AuthService } from '../services/authService';
import { StoreService } from '../services/storeService';
import { AccountStatus } from '../utils/constants';

export const AuthLoadState = {
  loading: 'loading',
  unauthenticated: 'unauthenticated',
  authenticated: 'authenticated',
};

const AuthContext = createContext(null);

// Bridges Firebase Auth state + the signed-in user's `stores/{uid}` doc
// into a single context that route guards read synchronously. All async
// work happens here in the stream listeners.
export function AuthProvider({ children }) {
  const [state, setState] = useState({
    authState: AuthLoadState.loading,
    user: null,
    store: null,
    storeLoaded: false,
  });
  const storeUnsubRef = useRef(null);

  useEffect(() => {
    // Firebase's onAuthStateChanged should fire almost immediately, but a
    // blocked/slow network to Google's auth endpoints (seen in some
    // corporate-network or locked-down browser setups) can leave it never
    // firing at all, stranding the router on its loading spinner forever.
    // Fail open to "unauthenticated" after a timeout so the app is still usable — a
    // real session gets restored the moment the callback does fire.
    const timeoutId = setTimeout(() => {
      setState((prev) =>
        prev.authState === AuthLoadState.loading
          ? { authState: AuthLoadState.unauthenticated, user: null, store: null, storeLoaded: false }
          : prev
      );
    }, 8000);

    const unsubAuth = AuthService.authStateChanges((u) => {
      clearTimeout(timeoutId);
      storeUnsubRef.current?.();
      storeUnsubRef.current = null;

      if (u == null) {
        setState({ authState: AuthLoadState.unauthenticated, user: null, store: null, storeLoaded: false });
        return;
      }

      setState((prev) => ({ ...prev, authState: AuthLoadState.authenticated, user: u, store: null, storeLoaded: false }));
      if (import.meta.env.DEV) {
        console.debug(`[auth-debug] signed in as uid=${u.uid} email=${u.email}`);
      }

      storeUnsubRef.current = StoreService.streamStore(
        u.uid,
        (s) => {
          if (import.meta.env.DEV) {
            console.debug(
              `[auth-debug] store snapshot for uid=${u.uid}: ${s == null ? 'NO DOCUMENT FOUND' : `found, accountStatus=${s.accountStatus}`}`
            );
          }
          setState((prev) => ({ ...prev, store: s, storeLoaded: true }));
          // The moment a store is first Approved, kick off its
          // maintenance-subscription trial. Fire-and-forget: the next
          // snapshot (once the write lands) carries the real trial fields.
          // Trial/subscription lapsed: mark the store closed so customers see
          // it as closed. The owner can still sign in — the router sends them
          // to /subscription. Runs on every snapshot until the write lands.
          if (s != null && s.accountStatus === AccountStatus.approved && s.subscriptionGateActive && s.isOpen) {
            StoreService.setOpenStatus(s.uid, false).catch((e) => console.debug('Auto-close failed:', e));
          }
          if (s != null && s.accountStatus === AccountStatus.approved && s.subscriptionStatus == null) {
            StoreService.startTrialIfNeeded(s, { ownerEmail: u.email }).then(() => {
              if (u.email) StoreService.registerTrialUsage({ email: u.email, storeId: s.uid });
            });
          }
        },
        (e) => {
          if (import.meta.env.DEV) console.debug(`[auth-debug] store stream ERROR for uid=${u.uid}: ${e}`);
          // Without this, a stream error would leave storeLoaded
          // permanently false, and computeRedirect (see AppRouter.jsx) never
          // sends an authenticated owner anywhere while it's false.
          setState((prev) => ({ ...prev, storeLoaded: true }));
        }
      );
    });

    return () => {
      clearTimeout(timeoutId);
      unsubAuth();
      storeUnsubRef.current?.();
    };
  }, []);

  // Called right after registration writes the store doc, so the context
  // doesn't need to wait for the next Firestore snapshot tick to know a
  // store now exists.
  const primeStore = (s) => setState((prev) => ({ ...prev, store: s, storeLoaded: true }));

  return <AuthContext.Provider value={{ ...state, primeStore }}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthContext);
}
