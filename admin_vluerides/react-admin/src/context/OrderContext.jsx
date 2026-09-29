import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as orderRepository from '../repositories/orderRepository';

// Mirrors lib/providers/order_provider.dart
const OrderContext = createContext(null);

function applyFilters(all, search, statusFilter, serviceFilter) {
  let list = all;
  if (statusFilter === 'active') list = list.filter((d) => d.isActive);
  else if (statusFilter === 'completed') list = list.filter((d) => d.isCompleted);
  else if (statusFilter === 'cancelled') list = list.filter((d) => d.isCancelled);

  if (serviceFilter !== 'all') list = list.filter((d) => d.serviceType === serviceFilter);

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        (d.riderName ?? '').toLowerCase().includes(q) ||
        d.pickupAddress.toLowerCase().includes(q),
    );
  }
  return list;
}

export function OrderProvider({ children }) {
  const [all, setAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('all');
  const [serviceFilter, setServiceFilterState] = useState('all');
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    setIsLoading(true);
    unsubscribeRef.current = orderRepository.streamDeliveries(
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

  const filtered = applyFilters(all, search, statusFilter, serviceFilter);

  const value = {
    deliveries: filtered,
    allDeliveries: all,
    isLoading,
    error,
    searchQuery: search,
    statusFilter,
    serviceFilter,
    totalCount: all.length,
    activeCount: all.filter((d) => d.isActive).length,
    completedCount: all.filter((d) => d.isCompleted).length,
    cancelledCount: all.filter((d) => d.isCancelled).length,
    startListening,
    setSearch: setSearchState,
    setStatusFilter: setStatusFilterState,
    setServiceFilter: setServiceFilterState,
    cancelDelivery: (id) => runAction(() => orderRepository.cancelDelivery(id)),
    deleteDelivery: (id) => runAction(() => orderRepository.deleteDelivery(id)),
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
