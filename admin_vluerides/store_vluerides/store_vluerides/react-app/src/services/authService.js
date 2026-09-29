import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth } from '../firebase';

export const AuthService = {
  // Returns an unsubscribe function, mirroring firebase/auth's own
  // onAuthStateChanged signature.
  authStateChanges(callback) {
    return onAuthStateChanged(auth, callback);
  },

  get currentUser() {
    return auth.currentUser;
  },

  signUp({ email, password }) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  signIn({ email, password }) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signOut() {
    return firebaseSignOut(auth);
  },

  sendPasswordResetEmail(email) {
    return firebaseSendPasswordResetEmail(auth, email);
  },
};
