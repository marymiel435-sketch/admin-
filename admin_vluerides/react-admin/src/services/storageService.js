import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase/config';

// Mirrors lib/services/storage_service.dart
// Named helpers matched to fixed paths, plus a generic uploadFile.
export async function uploadRiderPhoto(riderId, file) {
  return uploadFile(file, `riders/${riderId}/profile.jpg`);
}

export async function uploadStoreLogo(storeId, file) {
  return uploadFile(file, `stores/${storeId}/logo.jpg`);
}

export async function uploadAdminPhoto(adminId, file) {
  return uploadFile(file, `admins/${adminId}/profile.jpg`);
}

export async function uploadFile(file, path) {
  // Force a fresh ID token before uploading — ports the Dart service's
  // workaround for a race where Storage's auth-token attachment lagged
  // Firestore's when both fired together. Cheap no-op if already fresh, so
  // kept for parity even though the JS SDK may not need it.
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
  return getDownloadURL(snapshot.ref);
}

export async function deleteFile(url) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // swallow, same as the Dart service
  }
}
