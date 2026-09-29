import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import { adminFromMap } from '../models/adminModel';
import { customerFromMap } from '../models/customerModel';
import { riderFromMap } from '../models/riderModel';
import { deliveryRequestFromMap } from '../models/deliveryRequestModel';
import { storeFromMap } from '../models/storeModel';
import { productFromMap } from '../models/productModel';
import { subscriptionPlansConfigFromMap, DEFAULT_SUBSCRIPTION_PLANS_CONFIG, subscriptionPlansConfigToMap } from '../models/subscriptionPlanModel';
import { sosAlertFromMap } from '../models/sosAlertModel';
import * as presenceService from './presenceService';

// Mirrors lib/services/firestore_service.dart
// NOTE: only the methods needed so far (Admin + Dashboard + Customers +
// Riders + Delivery Requests + Stores + SOS + Analytics) are ported. The
// rest (Notifications, live locations) are unused by any screen in this
// port (see the Phase 2 rider-survey notes) and are intentionally skipped.

const admins = collection(db, 'admins');
const customers = collection(db, 'customers');
const riders = collection(db, 'riders');
const deliveries = collection(db, 'delivery_requests');
const stores = collection(db, 'stores');
const subscriptionPaymentsCol = collection(db, 'subscription_payments');
const sosAlertsCol = collection(db, 'sos_alerts');
const pabiliCategoriesConfigRef = doc(db, 'app_config', 'pabili_categories');
const subscriptionPlansConfigRef = doc(db, 'app_config', 'subscription_plans');
const DEFAULT_PABILI_CATEGORIES = ['Pharmacy', 'Grocery'];

// ================================================================
// ADMIN
// ================================================================

export async function getAdmin(uid) {
  const snap = await getDoc(doc(admins, uid));
  if (!snap.exists()) return null;
  return adminFromMap(snap.data(), snap.id);
}

export async function updateAdmin(uid, data) {
  await updateDoc(doc(admins, uid), data);
}

// ================================================================
// CUSTOMERS
// ================================================================

export function streamCustomers(onData, onError) {
  return onSnapshot(
    customers,
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          list.push(customerFromMap(docSnap.data(), docSnap.id));
        } catch {
          // skip malformed docs, same as the Dart service's try/catch-per-doc
        }
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onData(list);
    },
    onError,
  );
}

export async function getCustomer(id) {
  const snap = await getDoc(doc(customers, id));
  if (!snap.exists()) return null;
  return customerFromMap(snap.data(), snap.id);
}

export async function updateCustomerStatus(id, status) {
  await updateDoc(doc(customers, id), {
    accountStatus: status,
    updatedAt: serverTimestamp(),
  });
}

// Routed through a Cloud Function, same reasoning as deleteStore/deleteRider:
// deleting another user's Firebase Auth account requires the Admin SDK.
// See functions/index.js: deleteCustomerAccount.
export async function deleteCustomer(id) {
  await httpsCallable(functions, 'deleteCustomerAccount')({ customerId: id });
}

export async function isEmailUsed(email, excludeId) {
  const [riderDocs, customerDocs] = await Promise.all([
    getDocs(query(riders, where('email', '==', email))),
    getDocs(query(customers, where('email', '==', email))),
  ]);
  const riderHit = riderDocs.docs.some((d) => d.id !== excludeId);
  const customerHit = customerDocs.docs.some((d) => d.id !== excludeId);
  return riderHit || customerHit;
}

export async function isPhoneUsed(phone, excludeId) {
  const [riderDocs, customerDocs] = await Promise.all([
    getDocs(query(riders, where('phoneNumber', '==', phone))),
    getDocs(query(customers, where('phoneNumber', '==', phone))),
  ]);
  const riderHit = riderDocs.docs.some((d) => d.id !== excludeId);
  const customerHit = customerDocs.docs.some((d) => d.id !== excludeId);
  return riderHit || customerHit;
}

// ================================================================
// RIDERS
// ================================================================

export function streamRiders(onData, onError) {
  return onSnapshot(
    riders,
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          list.push(riderFromMap(docSnap.data(), docSnap.id));
        } catch {
          // skip malformed docs
        }
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onData(list);
    },
    onError,
  );
}

export async function getRider(id) {
  const snap = await getDoc(doc(riders, id));
  if (!snap.exists()) return null;
  return riderFromMap(snap.data(), snap.id);
}

export async function createRider(uid, data) {
  await setDoc(doc(riders, uid), data);
}

export async function updateRider(id, data) {
  await updateDoc(doc(riders, id), data);
}

// Stage 1 (Pending Approvals): paperwork looks legitimate, but nothing has
// been verified in person yet — this does NOT activate the account.
export async function requestDocuments(id) {
  await updateDoc(doc(riders, id), {
    accountStatus: 'Documents Requested',
    updatedAt: serverTimestamp(),
  });
}

export async function rejectRider(id, reason) {
  await updateDoc(doc(riders, id), {
    accountStatus: 'Rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function suspendRider(id) {
  await updateDoc(doc(riders, id), {
    accountStatus: 'Suspended',
    updatedAt: serverTimestamp(),
  });
}

// Stage 2 (Office Visit, docs verified in person) or Reactivating a
// Suspended rider — both are the same write, just different UI meaning.
export async function activateRider(id) {
  await updateDoc(doc(riders, id), {
    accountStatus: 'Approved',
    updatedAt: serverTimestamp(),
  });
}

// Routed through a Cloud Function, same reasoning as deleteStore: deleting
// another user's Firebase Auth account requires the Admin SDK. See
// functions/index.js: deleteRiderAccount.
export async function deleteRider(id) {
  await httpsCallable(functions, 'deleteRiderAccount')({ riderId: id });
}

export async function resolveRiderSos(id) {
  await updateDoc(doc(riders, id), {
    sosActive: false,
    updatedAt: serverTimestamp(),
  });
}

export function streamSosAlerts(onData, onError) {
  return onSnapshot(
    sosAlertsCol,
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          const alert = sosAlertFromMap(docSnap.data(), docSnap.id);
          if (alert.active) list.push(alert);
        } catch {
          // skip malformed docs
        }
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onData(list);
    },
    onError,
  );
}

// Resolved SOS alerts, most recently created first — separate from
// streamSosAlerts() (which only ever surfaces *active* alerts).
export function streamResolvedSosAlerts(onData, onError, limitCount = 30) {
  return onSnapshot(
    query(sosAlertsCol, orderBy('createdAt', 'desc'), limit(limitCount)),
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          const alert = sosAlertFromMap(docSnap.data(), docSnap.id);
          if (!alert.active) list.push(alert);
        } catch {
          // skip malformed docs
        }
      });
      onData(list);
    },
    onError,
  );
}

export async function resolveSosAlert(alert) {
  const batch = writeBatch(db);
  batch.update(doc(sosAlertsCol, alert.id), {
    active: false,
    isActive: false,
    resolved: true,
    isResolved: true,
    status: 'resolved',
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (alert.riderId) {
    batch.set(doc(riders, alert.riderId), { sosActive: false, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

// ================================================================
// DELIVERY REQUESTS
// ================================================================

function parseDelivery(docSnap) {
  try {
    return deliveryRequestFromMap(docSnap.data(), docSnap.id);
  } catch {
    return null;
  }
}

export function streamDeliveries(onData, onError) {
  return onSnapshot(
    deliveries,
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        const parsed = parseDelivery(docSnap);
        if (parsed) list.push(parsed);
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onData(list);
    },
    onError,
  );
}

export async function getDeliveriesForRider(riderId) {
  const snap = await getDocs(
    query(deliveries, where('riderId', '==', riderId), orderBy('createdAt', 'desc'), limit(20)),
  );
  return snap.docs.map(parseDelivery).filter(Boolean);
}

export async function cancelDelivery(id) {
  await updateDoc(doc(deliveries, id), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDelivery(id) {
  await deleteDoc(doc(deliveries, id));
}

// ================================================================
// ANALYTICS
// ================================================================

export async function getMonthlyRevenueChart(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);
  const snap = await getDocs(
    query(deliveries, where('createdAt', '>=', Timestamp.fromDate(start)), where('createdAt', '<=', Timestamp.fromDate(end))),
  );

  const monthly = Array.from({ length: 12 }, () => ({ revenue: 0.0, orders: 0, cancelled: 0 }));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const ts = data.createdAt;
    if (!ts) return;
    const date = ts.toDate();
    const month = date.getMonth();
    const status = data.status ?? '';
    if (COMPLETED_STATUSES.has(status)) {
      const fee = typeof data.deliveryFee === 'number' ? data.deliveryFee : 0.0;
      monthly[month].revenue += fee;
      monthly[month].orders += 1;
    }
    if (status === 'cancelled') monthly[month].cancelled += 1;
  });
  return monthly;
}

export async function getServiceTypeBreakdown(start, end) {
  const snap = await getDocs(
    query(deliveries, where('createdAt', '>=', Timestamp.fromDate(start)), where('createdAt', '<=', Timestamp.fromDate(end))),
  );
  const counts = {};
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const type = data.serviceType ?? 'Unknown';
    counts[type] = (counts[type] ?? 0) + 1;
  });
  return counts;
}

// ================================================================
// STORES
// ================================================================

export function streamStoreProducts(storeId, onData, onError) {
  return onSnapshot(
    collection(db, 'stores', storeId, 'products'),
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          list.push(productFromMap(docSnap.data(), docSnap.id));
        } catch {
          // skip malformed docs
        }
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    onError,
  );
}

export function streamStores(onData, onError) {
  return onSnapshot(
    stores,
    (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        try {
          list.push(storeFromMap(docSnap.data(), docSnap.id));
        } catch {
          // skip malformed docs
        }
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    onError,
  );
}

export function newStoreRef() {
  return doc(stores);
}

export async function createStore(id, data) {
  await setDoc(doc(stores, id), {
    ...data,
    rating: 0.0,
    totalOrders: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStore(id, data) {
  await updateDoc(doc(stores, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateStoreStatus(id, status) {
  await updateDoc(doc(stores, id), {
    accountStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function approveStore(id) {
  await updateDoc(doc(stores, id), {
    accountStatus: 'Approved',
    rejectionReason: null,
    updatedAt: serverTimestamp(),
  });
}

export async function rejectStore(id, reason) {
  await updateDoc(doc(stores, id), {
    accountStatus: 'Rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

// Routed through a Cloud Function (not a direct Firestore delete) because
// deleting the store's Firebase Auth account requires the Admin SDK — the
// client Auth SDK can only ever delete the *signed-in* user's own account,
// never another user's by UID. See functions/index.js: deleteStoreAccount.
export async function deleteStore(id) {
  await httpsCallable(functions, 'deleteStoreAccount')({ storeId: id });
}

// ================================================================
// STORE SUBSCRIPTIONS (maintenance trial / paid plan)
// ================================================================
// The Store dashboard app (separate codebase, same Firebase project) owns
// trial-start and payment-submission writes directly against stores/{uid} —
// this admin app only ever reviews and approves/rejects.

// Approving both activates the store's access and logs a permanent revenue
// record. A transaction, not a batch: the UI can't fully prevent a second
// tap landing before the store list stream reflects the first approval, and
// a batch would happily write a second subscription_payments record for the
// same submission. The read-then-write inside a transaction makes a
// duplicate call a no-op instead.
export async function approveSubscription(storeId, { endsAt, storeName, planId, planName, amount }) {
  const storeRef = doc(stores, storeId);
  await runTransaction(db, async (tx) => {
    const storeSnap = await tx.get(storeRef);
    const data = storeSnap.data();
    if (data && data.subscriptionStatus === 'active') {
      return; // already approved by an earlier call — don't double-log revenue
    }
    tx.update(storeRef, {
      subscriptionStatus: 'active',
      subscriptionStartedAt: serverTimestamp(),
      subscriptionEndsAt: Timestamp.fromDate(endsAt),
      subscriptionRejectionReason: null,
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(subscriptionPaymentsCol), {
      storeId,
      storeName,
      planId,
      planName,
      amount,
      approvedAt: serverTimestamp(),
    });
  });
}

// Backfills a ledger entry for a store that's already 'active' but never
// went through approveSubscription(). Uses a deterministic doc ID keyed on
// storeId, so backfilling the same store twice overwrites the same record
// instead of adding another ₱-worth of phantom revenue.
export async function logSubscriptionPayment({ storeId, storeName, planId, planName, amount, approvedAt }) {
  await setDoc(doc(subscriptionPaymentsCol, `backfill_${storeId}`), {
    storeId,
    storeName,
    planId,
    planName,
    amount,
    approvedAt: Timestamp.fromDate(approvedAt),
  });
}

export async function rejectSubscription(storeId, reason) {
  await updateDoc(doc(stores, storeId), {
    subscriptionStatus: 'rejected',
    subscriptionRejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export function streamSubscriptionPayments(onData, onError) {
  return onSnapshot(
    query(subscriptionPaymentsCol, orderBy('approvedAt', 'desc')),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data(), approvedAt: d.data().approvedAt?.toDate?.() ?? new Date() }))),
    onError,
  );
}

// ================================================================
// PABILI CATEGORIES
// ================================================================
// Admin-managed list of Pabili Store sub-types (e.g. Pharmacy, Grocery).
// Read live by the store-registration app so owners can only pick from
// categories the admin has defined.

export function streamPabiliCategories(onData, onError) {
  return onSnapshot(
    pabiliCategoriesConfigRef,
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_PABILI_CATEGORIES);
        return;
      }
      const names = snap.data()?.names;
      onData(Array.isArray(names) && names.length > 0 ? names : DEFAULT_PABILI_CATEGORIES);
    },
    onError,
  );
}

export async function getPabiliCategories() {
  const snap = await getDoc(pabiliCategoriesConfigRef);
  if (!snap.exists()) {
    await setDoc(pabiliCategoriesConfigRef, { names: DEFAULT_PABILI_CATEGORIES });
    return DEFAULT_PABILI_CATEGORIES;
  }
  const names = snap.data()?.names;
  return Array.isArray(names) && names.length > 0 ? names : DEFAULT_PABILI_CATEGORIES;
}

export async function savePabiliCategories(names) {
  await setDoc(pabiliCategoriesConfigRef, { names }, { merge: true });
}

// ================================================================
// SUBSCRIPTION PLANS CONFIG
// ================================================================

export function streamSubscriptionPlansConfig(onData, onError) {
  return onSnapshot(
    subscriptionPlansConfigRef,
    (snap) => onData(snap.exists() ? subscriptionPlansConfigFromMap(snap.data()) : DEFAULT_SUBSCRIPTION_PLANS_CONFIG),
    onError,
  );
}

export async function getSubscriptionPlansConfig() {
  const snap = await getDoc(subscriptionPlansConfigRef);
  if (!snap.exists()) {
    await setDoc(subscriptionPlansConfigRef, subscriptionPlansConfigToMap(DEFAULT_SUBSCRIPTION_PLANS_CONFIG));
    return DEFAULT_SUBSCRIPTION_PLANS_CONFIG;
  }
  return subscriptionPlansConfigFromMap(snap.data());
}

export async function saveSubscriptionPlansConfig(config) {
  await setDoc(subscriptionPlansConfigRef, subscriptionPlansConfigToMap(config), { merge: true });
}

// ================================================================
// FARE SETTINGS
// ================================================================

const fareSettingsRef = doc(db, 'app_config', 'fare_settings');
const DEFAULT_FARE_SETTINGS = {
  baseFare: 40.0,
  baseDistanceKm: 2.0,
  ratePerKm: 8.0,
  riderSharePercent: 80.0,
};

export async function getFareSettings() {
  const snap = await getDoc(fareSettingsRef);
  if (!snap.exists()) {
    await setDoc(fareSettingsRef, DEFAULT_FARE_SETTINGS);
    return DEFAULT_FARE_SETTINGS;
  }
  return snap.data();
}

export async function saveFareSettings(data) {
  await setDoc(fareSettingsRef, data, { merge: true });
}

// ================================================================
// DASHBOARD STATS
// ================================================================

const ACTIVE_STATUSES = new Set([
  'searching_rider', 'rider_assigned', 'accepted',
  'arriving', 'picked_up', 'in_transit', 'near_destination',
]);
const COMPLETED_STATUSES = new Set(['delivered', 'completed']);

export async function getDashboardStats() {
  const [allDeliveries, allRiders, allCustomers] = await Promise.all([
    getDocs(deliveries),
    getDocs(riders),
    getDocs(customers),
  ]);
  // A presence read failure (rules, connectivity) shouldn't break the
  // whole dashboard — an empty map just reads every rider as offline.
  const presenceMap = await presenceService.getOnlineStatusOnce().catch(() => ({}));

  let totalDeliveries = 0;
  let totalRevenue = 0;
  let activeRides = 0;
  let cancelledCount = 0;
  let totalRating = 0;
  let ratedCount = 0;

  allDeliveries.forEach((docSnap) => {
    const data = docSnap.data();
    const status = data.status ?? '';
    const fee = typeof data.deliveryFee === 'number' ? data.deliveryFee : 0;
    const rating = typeof data.customerRating === 'number' ? data.customerRating : null;

    if (COMPLETED_STATUSES.has(status)) {
      totalDeliveries += 1;
      totalRevenue += fee;
    }
    if (ACTIVE_STATUSES.has(status)) activeRides += 1;
    if (status === 'cancelled') cancelledCount += 1;
    if (rating !== null) {
      totalRating += rating;
      ratedCount += 1;
    }
  });

  let onlineRiders = 0;
  let pendingApprovals = 0;
  let awaitingOfficeVisit = 0;
  allRiders.forEach((docSnap) => {
    const data = docSnap.data();
    // Realtime Database's /status/{uid} is the only source consulted —
    // no entry means offline, full stop.
    if (presenceMap[docSnap.id] === true) onlineRiders += 1;
    if (data.accountStatus === 'Pending Approval') pendingApprovals += 1;
    if (data.accountStatus === 'Documents Requested') awaitingOfficeVisit += 1;
  });

  return {
    totalRevenue,
    totalDeliveries,
    activeRides,
    onlineRiders,
    pendingApprovals,
    awaitingOfficeVisit,
    totalCustomers: allCustomers.size,
    avgRating: ratedCount > 0 ? totalRating / ratedCount : 0.0,
    cancelledCount,
    cancellationRate:
      totalDeliveries + cancelledCount > 0
        ? (cancelledCount / (totalDeliveries + cancelledCount)) * 100
        : 0.0,
  };
}
