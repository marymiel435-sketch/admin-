import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Same Firebase project/Firestore database the Flutter app used
// (lib/firebase_options.dart, web platform config).
const firebaseConfig = {
  apiKey: 'AIzaSyASfd2BcyXhzGmj4WEaLs1KBlRzxN6WdMM',
  appId: '1:600750548829:web:9f142dccc2e6915e9c6ab4',
  messagingSenderId: '600750548829',
  projectId: 'vluerides-application-73c49',
  authDomain: 'vluerides-application-73c49.firebaseapp.com',
  storageBucket: 'vluerides-application-73c49.firebasestorage.app',
  measurementId: 'G-TKFBY3Z4K1',
};

// Named app (not the default) because this portal is served from the same
// domain as the admin panel under /store/ — Firebase Auth keys its saved
// login by app name, so this keeps the store owner's session separate from
// an admin's session in the same browser.
export const firebaseApp = initializeApp(firebaseConfig, 'store');
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
// Same region the vlue-rides mobile app's Cloud Functions (sendEmailOtp,
// verifyEmailOtp, checkPendingRegistration, reclaimEmailIfAbandoned) are
// deployed to — see vluerides/functions/src/index.ts. Those functions
// already exist on this Firebase project, so this app calls them directly
// rather than duplicating the OTP/email logic here.
export const functions = getFunctions(firebaseApp, 'asia-southeast1');
