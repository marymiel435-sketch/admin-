import { httpsCallable } from 'firebase/functions';

import { functions } from '../firebase';

// Thin wrapper around the Cloud Functions already deployed for the
// vlue-rides mobile app's email verification flow (see
// vluerides/functions/src/index.ts: sendEmailOtp / verifyEmailOtp /
// checkPendingRegistration / reclaimEmailIfAbandoned). They live on the
// same Firebase project this app uses, so no new backend code is needed —
// store registration reuses the exact same pending_registrations flow.
export const EmailOtpService = {
  // First call for a given email: omit pendingId. A resend reuses the
  // pendingId returned here instead of passing the email again, so the
  // code always goes to the address already on file for that session.
  async sendCode({ email, pendingId }) {
    const callable = httpsCallable(functions, 'sendEmailOtp');
    const result = await callable(pendingId ? { pendingId } : { email });
    return result.data.pendingId;
  },

  async verifyCode({ pendingId, code }) {
    const callable = httpsCallable(functions, 'verifyEmailOtp');
    const result = await callable({ pendingId, code });
    return result.data.verified === true;
  },

  // Re-checked immediately before creating the real Firebase Auth account,
  // rather than trusting the verified state held in this tab's memory.
  async checkPending(pendingId) {
    const callable = httpsCallable(functions, 'checkPendingRegistration');
    const result = await callable({ pendingId });
    return result.data;
  },

  // Best-effort cleanup of a leftover Auth account with no matching store
  // doc (e.g. an abandoned attempt) so it never blocks a genuine signup
  // with email-already-in-use.
  async reclaimIfAbandoned(email) {
    const callable = httpsCallable(functions, 'reclaimEmailIfAbandoned');
    await callable({ email });
  },
};
