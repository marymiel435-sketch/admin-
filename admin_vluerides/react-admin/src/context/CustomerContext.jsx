import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as customerRepository from '../repositories/customerRepository';

// Mirrors lib/providers/customer_provider.dart
const CustomerContext = createContext(null);

function applyFilters(all, search, statusFilter) {
  let list = all;
  if (statusFilter !== 'all') {
    list = list.filter((c) => c.accountStatus === statusFilter);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q),
    );
  }
  return list;
}

export function CustomerProvider({ children }) {
  const [all, setAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('all');
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    setIsLoading(true);
    unsubscribeRef.current = customerRepository.streamCustomers(
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

  const setSearch = useCallback((q) => setSearchState(q), []);
  const setStatusFilter = useCallback((s) => setStatusFilterState(s), []);

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

  const value = {
    customers: filtered,
    allCustomers: all,
    isLoading,
    error,
    searchQuery: search,
    statusFilter,
    totalCount: all.length,
    activeCount: all.filter((c) => c.accountStatus === 'Active').length,
    suspendedCount: all.filter((c) => c.accountStatus === 'Suspended').length,
    inactiveCount: all.filter((c) => c.accountStatus === 'Inactive').length,
    onlineCount: all.filter((c) => c.isOnline).length,
    startListening,
    setSearch,
    setStatusFilter,
    suspendCustomer: (id) => runAction(() => customerRepository.suspendCustomer(id)),
    activateCustomer: (id) => runAction(() => customerRepository.activateCustomer(id)),
    deleteCustomer: (id) => runAction(() => customerRepository.deleteCustomer(id)),
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider');
  return ctx;
}
