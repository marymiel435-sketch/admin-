// Firestore collection/field literals and default dropdown values.
//
// `accountStatus` casing must match the existing `riders/{uid}` convention
// used by the mobile app's admin approval flow.
export const AccountStatus = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

// Mobile-app visibility flag on `stores/{uid}`. Distinct from
// AccountStatus — never repurpose this for the approval workflow.
export const StoreVisibilityStatus = {
  active: 'active',
  inactive: 'inactive',
};

// Maintenance-subscription lifecycle on `stores/{uid}`. `null` means the
// trial hasn't been started yet (set once, client-side, the moment a
// store is first Approved — see useAuthState; the trial length and
// eligibility are re-validated server-side in `firestore.rules`). Only an
// admin can ever write `active` or `rejected`; the owner may only move to
// `pendingReview` after submitting payment proof.
export const SubscriptionStatus = {
  trial: 'trial',
  pendingReview: 'pendingReview',
  active: 'active',
  rejected: 'rejected',
};

// Store-maintenance subscription config. The free-trial length is
// admin-configurable at runtime via `app_config/subscription_plans.trialDays`
// (see `storeService.fetchSubscriptionConfig` and, for the server-side
// enforcement, `configuredTrialDays()` in `firestore.rules`) — trialDays
// here is only the fallback used if that field hasn't been set yet, never
// the source of truth.
//
// Paid-plan pricing/period lives in the same Firestore doc's `plans` array
// so it can also be changed without an app redeploy; monthlyPlanId /
// yearlyPlanId / fallbackPlans exist only as ids/defaults for when that doc
// hasn't been created yet.
export const SubscriptionPlan = {
  // Fallback only — see comment above.
  trialDays: 30,

  // Trial is flagged "ending soon" in the UI once this many days remain.
  trialEndingSoonDays: 3,

  trialPlanId: 'trial',
  monthlyPlanId: 'monthly',
  yearlyPlanId: 'yearly',

  // Used only if `app_config/subscription_plans` is missing/empty.
  fallbackPlans: [
    { id: 'monthly', name: 'Monthly', priceLabel: '₱199', periodDays: 30 },
    { id: 'yearly', name: 'Yearly', priceLabel: '₱1,999', periodDays: 365 },
  ],
};

export const FirestoreCollections = {
  stores: 'stores',
  products: 'products',
  notifications: 'notifications',
};

export const StoragePaths = {
  permitPhoto: (uid) => `permits/${uid}`,
  storePhoto: (uid) => `stores/${uid}/profile`,
  productPhoto: (storeId, productId) => `stores/${storeId}/products/${productId}`,
  subscriptionProof: (uid) => `subscription_proofs/${uid}`,
};

// The three store types this app registers, matching the mobile app's
// Pabili / Food Delivery / Pay Bills booking flows.
export const StoreCategories = {
  list: ['Food Store', 'Pabili Store', 'Bills'],

  // Category value that triggers the billType field.
  bills: 'Bills',

  // Category value that triggers the Pabili Category field.
  pabili: 'Pabili Store',
};

export const BillTypes = {
  list: ['Meralco', 'Manila Water', 'Maynilad', 'PLDT', 'Globe', 'Smart', 'Converge', 'Other'],
};
