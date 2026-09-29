import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import { db } from '../firebase';
import { Store } from '../models/store';
import { PaymentMethodInfo, SubscriptionConfig, SubscriptionPlanInfo } from '../models/subscriptionPlan';
import { FirestoreCollections, SubscriptionPlan, SubscriptionStatus } from '../utils/constants';

function storeRef(uid) {
  return doc(db, FirestoreCollections.stores, uid);
}

export const StoreService = {
  // Subscribes to a store doc; `callback` receives the Store (or null if
  // the doc doesn't exist). Returns an unsubscribe function.
  streamStore(uid, callback, onError) {
    return onSnapshot(
      storeRef(uid),
      (snap) => callback(snap.exists() ? Store.fromFirestore(snap) : null),
      onError
    );
  },

  async getStore(uid) {
    const snap = await getDoc(storeRef(uid));
    return snap.exists() ? Store.fromFirestore(snap) : null;
  },

  createStore({
    uid,
    storeName,
    category,
    billType,
    pabiliCategory,
    ownerName,
    phone,
    email,
    address,
    barangay,
    purok,
    latitude,
    longitude,
    permitPhotoUrl,
  }) {
    return setDoc(storeRef(uid), {
      // Written under all three names the mobile app is documented to
      // accept, so whichever field its admin/review screens actually
      // read, the store name shows up correctly.
      storeName,
      name: storeName,
      businessName: storeName,
      category,
      ...(billType != null ? { billType } : {}),
      ...(pabiliCategory != null ? { pabiliCategory } : {}),
      ownerName,
      phone,
      email,
      address,
      ...(barangay != null ? { barangay } : {}),
      ...(purok != null ? { purok } : {}),
      latitude,
      longitude,
      status: 'inactive',
      accountStatus: 'Pending',
      isOpen: true,
      rejectionReason: null,
      permitPhotoUrl: permitPhotoUrl ?? null,
      photoUrl: null,
      hours: null,
      // Subscription: untouched until approval starts the trial (see
      // startTrialIfNeeded). hasUsedTrial starts false and is
      // rules-enforced to only ever flip to true, once.
      subscriptionStatus: null,
      planId: null,
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStartedAt: null,
      subscriptionEndsAt: null,
      hasUsedTrial: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Partial profile edits from the dashboard. Never touches
  // accountStatus/status — those are admin/approval-workflow fields.
  updateStoreProfile({ uid, storeName, category, billType, address, barangay, purok, latitude, longitude, hours, photoUrl }) {
    const updates = { updatedAt: serverTimestamp() };
    if (storeName != null) {
      updates.storeName = storeName;
      updates.name = storeName;
      updates.businessName = storeName;
    }
    if (category != null) updates.category = category;
    if (billType != null) updates.billType = billType;
    if (address != null) updates.address = address;
    if (barangay != null) updates.barangay = barangay;
    if (purok != null) updates.purok = purok;
    if (latitude != null) updates.latitude = latitude;
    if (longitude != null) updates.longitude = longitude;
    if (hours != null) updates.hours = hours;
    if (photoUrl != null) updates.photoUrl = photoUrl;
    return updateDoc(storeRef(uid), updates);
  },

  // Owner-controlled "closed for now" toggle, independent of the
  // admin-controlled status/accountStatus fields.
  setOpenStatus(uid, isOpen) {
    return updateDoc(storeRef(uid), { isOpen, updatedAt: serverTimestamp() });
  },

  // The owner's product-organizing categories (e.g. "Main Dish", "Drinks"),
  // kept as a plain array on the store doc since it's just a small list of
  // names with no metadata of its own. Returns an unsubscribe function.
  streamProductCategories(uid, callback) {
    return this.streamStore(uid, (store) => callback(store?.productCategories ?? []));
  },

  addProductCategory(uid, category) {
    return updateDoc(storeRef(uid), {
      productCategories: arrayUnion(category),
      updatedAt: serverTimestamp(),
    });
  },

  removeProductCategory(uid, category) {
    return updateDoc(storeRef(uid), {
      productCategories: arrayRemove(category),
      updatedAt: serverTimestamp(),
    });
  },

  // The admin-managed Pabili category options, shown as a dropdown during
  // Pabili registration (before the applicant is signed in — see the
  // `app_config/pabili_categories` read rule). Tolerates a couple of
  // common array-field-name/shape choices since the doc is maintained
  // from an external admin panel, not this app.
  async fetchPabiliCategories() {
    const snap = await getDoc(doc(db, 'app_config', 'pabili_categories'));
    const data = snap.data();
    if (data == null) return [];
    for (const field of ['categories', 'list', 'items', 'names', 'values']) {
      const raw = data[field];
      if (Array.isArray(raw)) {
        return raw
          .map((e) => (e != null && typeof e === 'object' ? String(e.name ?? e.label ?? '') : String(e)))
          .filter((s) => s !== '');
      }
    }
    return [];
  },

  // Starts the maintenance-subscription trial exactly once, the first
  // time this store's subscriptionStatus is seen unset. The trial length
  // is admin-configurable (app_config/subscription_plans.trialDays — see
  // fetchSubscriptionConfig), so this fetches the live value instead of
  // hardcoding it. Firestore rules independently re-derive and enforce
  // trialEndsAt against that same config doc and the server clock — the
  // value computed here is only what we expect the rule to accept, never
  // trusted as-is by the rule itself.
  //
  // `ownerEmail` (the Firebase Auth-verified email — pass user.email,
  // never a form field) is checked against trial_registry/{email} first,
  // so a store owner who already used a trial under this email (e.g. by
  // deleting their old account and re-registering) gets an already-expired
  // trial instead of a fresh one — matching what the rule would enforce
  // anyway, just without a round-trip denial.
  //
  // Call registerTrialUsage right after this succeeds — see useAuthState,
  // which is safe to call on every snapshot until the write lands.
  async startTrialIfNeeded(store, { ownerEmail } = {}) {
    if (store.subscriptionStatus != null) return;

    let alreadyUsedTrial = false;
    const email = ownerEmail?.trim().toLowerCase();
    if (email) {
      const registrySnap = await getDoc(doc(db, 'trial_registry', email));
      alreadyUsedTrial = registrySnap.exists();
    }

    const config = await this.fetchSubscriptionConfig();
    const trialEnd = alreadyUsedTrial
      ? new Date()
      : new Date(Date.now() + config.trialDays * 24 * 60 * 60 * 1000);
    await updateDoc(storeRef(store.uid), {
      subscriptionStatus: SubscriptionStatus.trial,
      planId: SubscriptionPlan.trialPlanId,
      trialStartedAt: serverTimestamp(),
      trialEndsAt: Timestamp.fromDate(trialEnd),
      hasUsedTrial: true,
      updatedAt: serverTimestamp(),
    });
  },

  // Records that this Firebase Auth-verified email has now used its free
  // trial, so a store owner can't get another one by deleting their
  // account and re-registering with the same email. Idempotent — safe to
  // call every time startTrialIfNeeded runs. Firestore rules restrict this
  // doc to only ever being written by its own matching auth email.
  registerTrialUsage({ email, storeId }) {
    const key = email.trim().toLowerCase();
    if (key === '') return Promise.resolve();
    return setDoc(
      doc(db, 'trial_registry', key),
      { storeId, usedAt: serverTimestamp() },
      { merge: true }
    );
  },

  // The admin-configured subscription setup — paid plan options, the
  // free-trial length, and the accounts to pay into — read from
  // `app_config/subscription_plans` (write-protected to admins by
  // `firestore.rules`; mirrors fetchPabiliCategories's tolerant-parsing
  // pattern). Falls back to SubscriptionPlan.trialDays/fallbackPlans for
  // whichever part hasn't been configured yet; paymentMethods has no
  // fallback since it's a newer field that may not exist on older docs —
  // an empty list just means the UI shows nothing/a fallback message.
  async fetchSubscriptionConfig() {
    let trialDays = SubscriptionPlan.trialDays;
    let plans = SubscriptionPlan.fallbackPlans.map(
      (p) => new SubscriptionPlanInfo({ id: p.id, name: p.name, priceLabel: p.priceLabel, periodDays: p.periodDays })
    );
    let paymentMethods = [];
    try {
      const snap = await getDoc(doc(db, 'app_config', 'subscription_plans'));
      const data = snap.data();
      const rawTrialDays = data?.trialDays;
      if (typeof rawTrialDays === 'number' && rawTrialDays > 0) trialDays = rawTrialDays;
      const rawPlans = data?.plans;
      if (Array.isArray(rawPlans) && rawPlans.length > 0) {
        plans = rawPlans.filter((p) => p != null && typeof p === 'object').map(SubscriptionPlanInfo.fromMap);
      }
      const rawPaymentMethods = data?.paymentMethods;
      if (Array.isArray(rawPaymentMethods) && rawPaymentMethods.length > 0) {
        paymentMethods = rawPaymentMethods
          .filter((p) => p != null && typeof p === 'object')
          .map(PaymentMethodInfo.fromMap);
      }
    } catch {
      // Falls through to the hardcoded defaults collected above.
    }
    return new SubscriptionConfig({ trialDays, plans, paymentMethods });
  },

  // Owner submits proof of payment (e.g. a GCash/bank transfer receipt)
  // for an admin to review — mirrors resubmitAfterRejection: the owner
  // can only ever move themselves to 'pendingReview', never 'active'.
  submitPaymentProof({ uid, proofUrl, planId }) {
    return updateDoc(storeRef(uid), {
      subscriptionStatus: SubscriptionStatus.pendingReview,
      planId,
      paymentProofUrl: proofUrl,
      subscriptionRejectionReason: null,
      updatedAt: serverTimestamp(),
    });
  },

  // Store owner edits their info after a rejection and resubmits — forces
  // accountStatus back to Pending and clears the rejection reason.
  resubmitAfterRejection({ uid, updatedFields }) {
    const fields = { ...updatedFields };
    if (fields.storeName != null) {
      fields.name = fields.storeName;
      fields.businessName = fields.storeName;
    }
    return updateDoc(storeRef(uid), {
      ...fields,
      accountStatus: 'Pending',
      rejectionReason: null,
      updatedAt: serverTimestamp(),
    });
  },
};
