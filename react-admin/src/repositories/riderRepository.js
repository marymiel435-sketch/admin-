import * as authService from '../services/authService';
import * as firestoreService from '../services/firestoreService';
import * as storageService from '../services/storageService';

// Mirrors lib/repositories/rider_repository.dart
export function streamRiders(onData, onError) {
  return firestoreService.streamRiders(onData, onError);
}

export function getRider(id) {
  return firestoreService.getRider(id);
}

export function isEmailUsed(email) {
  return firestoreService.isEmailUsed(email);
}

export function isPhoneUsed(phone) {
  return firestoreService.isPhoneUsed(phone);
}

export function getRiderDeliveries(id) {
  return firestoreService.getDeliveriesForRider(id);
}

export async function updateRider({ uid, data, profilePhoto }) {
  const urlMap = { ...data };

  if (profilePhoto) {
    urlMap.profilePhotoUrl = await storageService.uploadFile(profilePhoto, `rider_documents/${uid}/profile.jpg`);
  }

  urlMap.updatedAt = new Date();
  await firestoreService.updateRider(uid, urlMap);
}

export function requestDocuments(id) {
  return firestoreService.requestDocuments(id);
}

export function rejectRider(id, reason) {
  return firestoreService.rejectRider(id, reason);
}

export function suspendRider(id) {
  return firestoreService.suspendRider(id);
}

export function activateRider(id) {
  return firestoreService.activateRider(id);
}

export function deleteRider(id) {
  return firestoreService.deleteRider(id);
}

export function resolveSos(id) {
  return firestoreService.resolveRiderSos(id);
}

export async function createRider({ riderData, email, password, profilePhoto }) {
  const uid = await authService.createFirebaseUser({ email, password });

  const data = {
    ...riderData,
    uid,
    email,
    profilePhotoUrl: null,
    licensePhotoUrl: null,
    orCrPhotoUrl: null,
    selfieWithLicenseUrl: null,
    role: 'rider',
    accountStatus: 'Approved',
    isOnline: false,
    rating: 0.0,
    totalDeliveries: 0,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await firestoreService.createRider(uid, data);

  if (profilePhoto) {
    const profilePhotoUrl = await storageService.uploadFile(profilePhoto, `rider_documents/${uid}/profile.jpg`);
    await firestoreService.updateRider(uid, { profilePhotoUrl, updatedAt: new Date() });
  }
}
