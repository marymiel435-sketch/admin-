import { createContext, useCallback, useContext, useState } from 'react';
import * as firestoreService from '../services/firestoreService';

// Mirrors lib/providers/dashboard_provider.dart
const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await firestoreService.getDashboardStats();
      setStats(result);
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isLoading,
    error,
    stats,
    totalRevenue: stats.totalRevenue ?? 0.0,
    totalDeliveries: stats.totalDeliveries ?? 0,
    activeRides: stats.activeRides ?? 0,
    onlineRiders: stats.onlineRiders ?? 0,
    pendingApprovals: stats.pendingApprovals ?? 0,
    awaitingOfficeVisit: stats.awaitingOfficeVisit ?? 0,
    totalCustomers: stats.totalCustomers ?? 0,
    avgRating: stats.avgRating ?? 0.0,
    cancellationRate: stats.cancellationRate ?? 0.0,
    loadStats,
    refresh: loadStats,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
