import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as riderRepository from '../repositories/riderRepository';

// Mirrors lib/providers/rider_provider.dart
const RiderContext = createContext(null);

function applyFilters(all, search, statusFilter) {
  let list = all;
  if (statusFilter !== 'all') list = list.filter((r) => r.accountStatus === statusFilter);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q) ||
        r.plateNumber.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }
  return list;
}

export function RiderProvider({ children }) {
  const [all, setAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('all');
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    setIsLoading(true);
    unsubscribeRef.current = riderRepository.streamRiders(
      (list) => {
        setAll(list);
        setIsLoading(false);
        setError(null);
      },
      (e) => {
        setError(e?.message ?? String(e));
        setIsLoading(false);
      },
    );
  }, []);

  const runAction = useCallback(async (action) => {
    try {
      await action();
      return true;
    } catch (e) {
      setError(e?.message ?? String(e));
      return false;
    }
  }, []);

  const filtered = applyFilters(all, search, statusFilter);
  const pendingApprovals = all.filter((r) => r.accountStatus === 'Pending Approval');
  const documentsRequested = all
    .filter((r) => r.accountStatus === 'Documents Requested')
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
  const sosRiders = all
    .filter((r) => r.sosActive)
    .sort((a, b) => (b.sosAt ?? b.updatedAt).getTime() - (a.sosAt ?? a.updatedAt).getTime());

  const value = {
    riders: filtered,
    allRiders: all,
    pendingApprovals,
    documentsRequested,
    sosRiders,
    isLoading,
    isCreating,
    isUpdating,
    error,
    searchQuery: search,
    statusFilter,
    totalCount: all.length,
    pendingCount: all.filter((r) => r.isPendingApproval).length,
    documentsRequestedCount: all.filter((r) => r.isDocumentsRequested).length,
    sosCount: all.filter((r) => r.sosActive).length,
    startListening,
    setSearch: setSearchState,
    setStatusFilter: setStatusFilterState,
    createRider: async ({ riderData, email, password, profilePhoto }) => {
      setIsCreating(true);
      setError(null);
      try {
        await riderRepository.createRider({ riderData, email, password, profilePhoto });
        setIsCreating(false);
        return true;
      } catch (e) {
        setIsCreating(false);
        setError(e?.message ?? String(e).replace(/^Exception: /, ''));
        return false;
      }
    },
    updateRider: async ({ uid, data, profilePhoto }) => {
      setIsUpdating(true);
      setError(null);
      try {
        await riderRepository.updateRider({ uid, data, profilePhoto });
        setIsUpdating(false);
        return true;
      } catch (e) {
        setIsUpdating(false);
        setError(e?.message ?? String(e).replace(/^Exception: /, ''));
        return false;
      }
    },
    requestDocuments: (id) => runAction(() => riderRepository.requestDocuments(id)),
    rejectRider: (id, reason) => runAction(() => riderRepository.rejectRider(id, reason)),
    suspendRider: (id) => runAction(() => riderRepository.suspendRider(id)),
    activateRider: (id) => runAction(() => riderRepository.activateRider(id)),
    deleteRider: (id) => runAction(() => riderRepository.deleteRider(id)),
    resolveSos: (id) => runAction(() => riderRepository.resolveSos(id)),
    isEmailUsed: (email) => riderRepository.isEmailUsed(email),
    isPhoneUsed: (phone) => riderRepository.isPhoneUsed(phone),
    getRiderDeliveries: (uid) => riderRepository.getRiderDeliveries(uid),
    clearError: () => setError(null),
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRiders() {
  const ctx = useContext(RiderContext);
  if (!ctx) throw new Error('useRiders must be used within RiderProvider');
  return ctx;
}
