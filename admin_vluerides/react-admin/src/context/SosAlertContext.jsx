import { createContext, useCallback, useContext, useRef, useState } from 'react';
import * as firestoreService from '../services/firestoreService';

// Mirrors lib/providers/sos_alert_provider.dart — tracks active SOS alerts
// app-wide so the sidebar can show a blinking indicator even while the admin
// isn't on the SOS screen. "Seen" is tracked per-session (in-memory).
const SosAlertContext = createContext(null);

export function SosAlertProvider({ children }) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const [, forceRender] = useState(0);
  const unsubscribeRef = useRef(null);

  const startListening = useCallback(() => {
    if (unsubscribeRef.current) return;
    unsubscribeRef.current = firestoreService.streamSosAlerts((list) => setActiveAlerts(list), () => {});
  }, []);

  const markAllSeen = useCallback(() => {
    setActiveAlerts((current) => {
      const before = seenIdsRef.current.size;
      current.forEach((a) => seenIdsRef.current.add(a.id));
      if (seenIdsRef.current.size !== before) forceRender((n) => n + 1);
      return current;
    });
  }, []);

  const hasUnseenAlert = activeAlerts.some((a) => !seenIdsRef.current.has(a.id));

  const value = { activeAlerts, hasUnseenAlert, startListening, markAllSeen };

  return <SosAlertContext.Provider value={value}>{children}</SosAlertContext.Provider>;
}

export function useSosAlerts() {
  const ctx = useContext(SosAlertContext);
  if (!ctx) throw new Error('useSosAlerts must be used within SosAlertProvider');
  return ctx;
}
