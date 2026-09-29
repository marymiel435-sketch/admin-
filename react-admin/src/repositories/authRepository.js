import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { adminFromMap } from '../models/adminModel';
import * as authService from '../services/authService';

// Mirrors lib/repositories/auth_repository.dart

export function onAuthStateChangedListener(callback) {
  return authService.onAuthStateChangedListener(callback);
}

export async function signIn(email, password) {
  const result = await authService.signInAdmin({ email, password });
  return adminFromMap(result.data, result.user.uid);
}

// Returns the current user's AdminModel if a valid Firebase Auth session
// exists and the Firestore admin doc confirms the role. Used for session
// restore on app startup — no password required.
export async function getCurrentAdmin() {
  const uid = authService.getCurrentUser()?.uid;
  if (!uid) return null;
  const data = await authService.getAdminData(uid);
  if (!data) return null;
  return adminFromMap(data, uid);
}

export async function signOut() {
  await authService.signOut();
}

export async function sendPasswordReset(email) {
  await authService.sendPasswordReset(email);
}

export async function isAdmin(uid) {
  return authService.isAdmin(uid);
}

export function currentUserId() {
  return authService.getCurrentUser()?.uid ?? null;
}

export function currentUserEmail() {
  return authService.getCurrentUser()?.email ?? null;
}

export async function ensureAdminDocExists(uid, email) {
  const ref = doc(db, 'admins', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      name: 'Administrator',
      role: 'admin',
      createdAt: serverTimestamp(),
    });
  }
}
