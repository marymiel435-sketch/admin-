import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';

// Same values as lib/firebase_options.dart -> DefaultFirebaseOptions.web
export const firebaseConfig = {
  apiKey: 'AIzaSyASfd2BcyXhzGmj4WEaLs1KBlRzxN6WdMM',
  appId: '1:600750548829:web:d84b0ad711ea6ae29c6ab4',
  messagingSenderId: '600750548829',
  projectId: 'vluerides-application-73c49',
  authDomain: 'vluerides-application-73c49.firebaseapp.com',
  databaseURL: 'https://vluerides-application-73c49-default-rtdb.firebaseio.com',
  storageBucket: 'vluerides-application-73c49.firebasestorage.app',
  measurementId: 'G-Y1HXCCN00M',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Cloud Functions are deployed to asia-southeast1 (see functions/index.js) —
// must match here or httpsCallable silently targets the wrong region.
export const functions = getFunctions(app, 'asia-southeast1');
export const rtdb = getDatabase(app, firebaseConfig.databaseURL);
