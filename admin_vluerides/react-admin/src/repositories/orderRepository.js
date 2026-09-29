import * as firestoreService from '../services/firestoreService';

// Mirrors lib/repositories/order_repository.dart
export function streamDeliveries(onData, onError) {
  return firestoreService.streamDeliveries(onData, onError);
}

export function cancelDelivery(id) {
  return firestoreService.cancelDelivery(id);
}

export function deleteDelivery(id) {
  return firestoreService.deleteDelivery(id);
}
