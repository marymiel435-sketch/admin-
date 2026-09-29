import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as presenceService from '../services/presenceService';

// Mirrors lib/providers/presence_provider.dart
const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const [online, setOnline] = useState({});
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    unsubscribeRef.current = presenceService.streamOnlineStatus(
      (data) => setOnline(data),
      // On error, drop back to an empty map so every rider reads as offline
      // rather than showing stale data.
      () => setOnline({}),
    );
  }, []);

  const isRiderOnline = (rider) => online[rider.uid] ?? false;
  const onlineCountFor = (riders) => riders.filter(isRiderOnline).length;

  const value = { startListening, isRiderOnline, onlineCountFor };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('usePresence must be used within PresenceProvider');
  return ctx;
}
