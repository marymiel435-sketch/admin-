import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as storeRepository from '../repositories/storeRepository';
import { SubscriptionState } from '../models/storeModel';

// Mirrors lib/providers/store_provider.dart
const StoreContext = createContext(null);

function applyFilters(all, search, statusFilter, categoryFilter) {
  let list = all;
  if (statusFilter !== 'all') list = list.filter((s) => s.accountStatus === statusFilter);
  if (categoryFilter !== 'all') list = list.filter((s) => s.category === categoryFilter);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.phoneNumber.toLowerCase().includes(q),
    );
  }
  return list;
}

export function StoreProvider({ children }) {
  const [all, setAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('all');
  const [categoryFilter, setCategoryFilterState] = useState('all');
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    setIsLoading(true);
    unsubscribeRef.current = storeRepository.streamStores(
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

  const retry = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setError(null);
    startListening();
  }, [startListening]);

  // Callers awaiting an action still hold the pre-call render's `error`, so
  // the message is also kept in a ref they can read right after the await.
  const lastErrorRef = useRef(null);

  const runAction = useCallback(async (action) => {
    lastErrorRef.current = null;
    try {
      await action();
      return true;
    } catch (e) {
      lastErrorRef.current = e?.message ?? String(e);
      setError(lastErrorRef.current);
      return false;
    }
  }, []);

  const runSavingAction = useCallback(async (action) => {
    setIsSaving(true);
    setError(null);
    try {
      await action();
      setIsSaving(false);
      return true;
    } catch (e) {
      setIsSaving(false);
      setError((e?.message ?? String(e)).replace(/^Exception: /, ''));
      return false;
    }
  }, []);

  const filtered = applyFilters(all, search, statusFilter, categoryFilter);
  const pendingApprovals = all.filter((s) => s.isPending);
  const pendingSubscriptionReviews = all.filter((s) => s.subscriptionState === SubscriptionState.pendingReview);

  const value = {
    stores: filtered,
    allStores: all,
    pendingApprovals,
    pendingSubscriptionReviews,
    pendingSubscriptionCount: pendingSubscriptionReviews.length,
    isLoading,
    isSaving,
    error,
    searchQuery: search,
    statusFilter,
    categoryFilter,
    totalCount: all.length,
    pendingCount: all.filter((s) => s.isPending).length,
    approvedCount: all.filter((s) => s.isApproved).length,
    suspendedCount: all.filter((s) => s.isSuspended).length,
    hasActiveFilters: Boolean(search) || statusFilter !== 'all' || categoryFilter !== 'all',
    startListening,
    retry,
    setSearch: setSearchState,
    setStatusFilter: setStatusFilterState,
    setCategoryFilter: setCategoryFilterState,
    createStore: (args) => runSavingAction(() => storeRepository.createStore(args)),
    updateStore: (args) => runSavingAction(() => storeRepository.updateStore(args)),
    approveStore: (id) => runAction(() => storeRepository.approveStore(id)),
    rejectStore: (id, reason) => runAction(() => storeRepository.rejectStore(id, reason)),
    suspendStore: (id) => runAction(() => storeRepository.updateStoreStatus(id, 'Suspended')),
    activateStore: (id) => runAction(() => storeRepository.updateStoreStatus(id, 'Approved')),
    approveSubscription: (id, endsAt, args) => runAction(() => storeRepository.approveSubscription(id, endsAt, args)),
    rejectSubscription: (id, reason) => runAction(() => storeRepository.rejectSubscription(id, reason)),
    deleteStore: (id) => runAction(() => storeRepository.deleteStore(id)),
    getLastError: () => lastErrorRef.current,
    clearError: () => setError(null),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStores() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStores must be used within StoreProvider');
  return ctx;
}
