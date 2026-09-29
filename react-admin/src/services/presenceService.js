import { ref, onValue, get } from 'firebase/database';
import { rtdb } from '../firebase/config';

// Mirrors lib/services/presence_service.dart
// Reads the rider app's presence data at /status/{uid}, written using
// Firebase's standard onDisconnect() presence pattern — {state, last_changed}.
const statusRef = ref(rtdb, 'status');

function parseStatus(raw) {
  const result = {};
  if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw)) {
      if (value && typeof value === 'object') {
        result[key] = value.state === 'online';
      }
    }
  }
  return result;
}

export function streamOnlineStatus(callback, onError) {
  return onValue(
    statusRef,
    (snapshot) => callback(parseStatus(snapshot.val())),
    onError,
  );
}

export async function getOnlineStatusOnce() {
  const snapshot = await get(statusRef);
  return parseStatus(snapshot.val());
}
