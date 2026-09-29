import { initializeApp, deleteApp } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebase/config';

// Mirrors lib/services/auth_service.dart

export function onAuthStateChangedListener(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function signInAdmin({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
  const uid = credential.user.uid;
  const adminDoc = await getDoc(doc(db, 'admins', uid));

  if (!adminDoc.exists()) {
    await firebaseSignOut(auth);
    throw new Error('Access denied. This account does not have admin privileges.');
  }

  const data = adminDoc.data();
  if (data.role !== 'admin') {
    await firebaseSignOut(auth);
    throw new Error('Access denied. Only admin accounts can access this panel.');
  }

  return { user: credential.user, data };
}

export async function signOut() {
  await firebaseSignOut(auth);
}

// Creates a new Firebase Auth user on a throwaway secondary app instance so
// the admin's own session (on the default app) is never replaced — plain
// createUserWithEmailAndPassword() on the default app would sign the admin
// out and sign in as the new rider instead. Mirrors AuthService's
// createFirebaseUser() secondary-app trick.
export async function createFirebaseUser({ email, password }) {
  const appName = `rider-registration-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password.trim());
    return credential.user.uid;
  } finally {
    await secondaryAuth.signOut();
    await deleteApp(secondaryApp);
  }
}

export async function getUserRole(uid) {
  try {
    if ((await getDoc(doc(db, 'admins', uid))).exists()) return 'admin';
    if ((await getDoc(doc(db, 'riders', uid))).exists()) return 'rider';
    if ((await getDoc(doc(db, 'customers', uid))).exists()) return 'customer';
    return null;
  } catch {
    return null;
  }
}

export async function isAdmin(uid) {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    if (!snap.exists()) return false;
    return snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

// Fetches admin Firestore data without re-authenticating — used for
// restoring an existing Firebase Auth session on app startup.
export async function getAdminData(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  if (!snap.exists()) return null;
  if (snap.data()?.role !== 'admin') return null;
  return snap.data();
}

export async function disableUserAccount(uid) {
  await updateDoc(doc(db, 'customers', uid), { status: 'disabled' });
}

export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email.trim());
}
