import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as authRepository from '../repositories/authRepository';

// Mirrors lib/providers/auth_provider.dart
export const AuthStatus = {
  initial: 'initial',
  loading: 'loading',
  authenticated: 'authenticated',
  unauthenticated: 'unauthenticated',
  error: 'error',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(AuthStatus.initial);
  const [admin, setAdminState] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  // Guards tryRestoreSession() so it only ever runs once, like the Dart
  // provider's `if (_status != AuthStatus.initial) return;` guard.
  const restoreAttempted = useRef(false);

  const tryRestoreSession = useCallback(async () => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;
    setIsRestoringSession(true);
    setStatus(AuthStatus.loading);

    try {
      const restoredAdmin = await authRepository.getCurrentAdmin();
      if (restoredAdmin) {
        setAdminState(restoredAdmin);
        setStatus(AuthStatus.authenticated);
      } else {
        // Firebase Auth has a session but no valid admin doc — sign out cleanly.
        await authRepository.signOut();
        setStatus(AuthStatus.unauthenticated);
      }
    } catch {
      // Network or permission error — fall back to login without signing out
      // (might be a temporary failure; let the user try manually).
      setStatus(AuthStatus.unauthenticated);
    }
    setIsRestoringSession(false);
  }, []);

  const signIn = useCallback(async (email, password) => {
    setStatus(AuthStatus.loading);
    setErrorMessage(null);

    try {
      const signedInAdmin = await authRepository.signIn(email, password);
      setAdminState(signedInAdmin);
      setStatus(AuthStatus.authenticated);
      return true;
    } catch (e) {
      setStatus(AuthStatus.error);
      setErrorMessage((e?.message || String(e)).replace(/^Exception: /, ''));
      return false;
    }
  }, []);

  const sendPasswordReset = useCallback((email) => authRepository.sendPasswordReset(email), []);

  const signOut = useCallback(async () => {
    await authRepository.signOut();
    setAdminState(null);
    setStatus(AuthStatus.unauthenticated);
  }, []);

  const setAdmin = useCallback((newAdmin) => {
    setAdminState(newAdmin);
    setStatus(AuthStatus.authenticated);
  }, []);

  const setUnauthenticated = useCallback(() => {
    setAdminState(null);
    setStatus(AuthStatus.unauthenticated);
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const value = {
    status,
    admin,
    errorMessage,
    isAuthenticated: status === AuthStatus.authenticated,
    isRestoringSession,
    adminId: authRepository.currentUserId(),
    adminEmail: authRepository.currentUserEmail(),
    tryRestoreSession,
    signIn,
    sendPasswordReset,
    signOut,
    setAdmin,
    setUnauthenticated,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
