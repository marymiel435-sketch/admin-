import * as firestoreService from '../services/firestoreService';
import * as storageService from '../services/storageService';

// Mirrors lib/repositories/store_repository.dart
export function streamStores(onData, onError) {
  return firestoreService.streamStores(onData, onError);
}

export function streamProducts(storeId, onData, onError) {
  return firestoreService.streamStoreProducts(storeId, onData, onError);
}

export async function createStore({ data, logo }) {
  const docRef = firestoreService.newStoreRef();
  const id = docRef.id;
  let logoUrl = null;
  if (logo) {
    logoUrl = await storageService.uploadStoreLogo(id, logo);
  }
  await firestoreService.createStore(id, { ...data, logoUrl });
}

export async function updateStore({ id, data, newLogo }) {
  const updates = { ...data };
  if (newLogo) {
    updates.logoUrl = await storageService.uploadStoreLogo(id, newLogo);
  }
  await firestoreService.updateStore(id, updates);
}

export function updateStoreStatus(id, status) {
  return firestoreService.updateStoreStatus(id, status);
}

export function approveStore(id) {
  return firestoreService.approveStore(id);
}

export function rejectStore(id, reason) {
  return firestoreService.rejectStore(id, reason);
}

export function deleteStore(id) {
  return firestoreService.deleteStore(id);
}

export function approveSubscription(id, endsAt, { storeName, planId, planName, amount }) {
  return firestoreService.approveSubscription(id, { endsAt, storeName, planId, planName, amount });
}

export function rejectSubscription(id, reason) {
  return firestoreService.rejectSubscription(id, reason);
}
