// Mirrors lib/models/store_model.dart
export const CATEGORIES = ['Food Store', 'Pabili Store', 'Bills'];
export const BILL_TYPES = [
  'Electricity', 'Water', 'Internet', 'Phone / Telecoms',
  'Cable TV', 'Insurance', 'Government Fees', 'Others',
];
export const PABILI_TYPES = ['Pharmacy', 'Grocery'];
export const ACCOUNT_STATUSES = ['Pending', 'Approved', 'Rejected', 'Suspended'];

const FOOD_KEYWORDS = ['restaurant', 'fast food', 'bakery', 'food', 'cafe'];

function resolveCategory(raw) {
  if (raw == null) return 'Food Store';
  const s = String(raw);
  if (CATEGORIES.includes(s)) return s;
  const lower = s.toLowerCase();
  return FOOD_KEYWORDS.some((k) => lower.includes(k)) ? 'Food Store' : 'Pabili Store';
}

// Stores created before the approval workflow existed used 'Active'. Those
// (and any doc with a missing/unrecognized status) are treated as already
// vetted so they don't silently disappear from customers on migration.
function resolveStatus(raw) {
  const s = raw != null ? String(raw) : null;
  if (!s || s === 'Active') return 'Approved';
  return ACCOUNT_STATUSES.includes(s) ? s : 'Approved';
}

function toDate(ts, fallback) {
  return ts?.toDate ? ts.toDate() : fallback;
}
function toDateOrNull(ts) {
  return ts?.toDate ? ts.toDate() : null;
}

export const SubscriptionState = {
  notStarted: 'notStarted',
  activeTrial: 'activeTrial',
  trialEndingSoon: 'trialEndingSoon',
  trialExpired: 'trialExpired',
  pendingReview: 'pendingReview',
  rejected: 'rejected',
  activeSubscription: 'activeSubscription',
  subscriptionExpired: 'subscriptionExpired',
};

export const SUBSCRIPTION_STATE_LABELS = {
  notStarted: 'Trial Not Started',
  activeTrial: 'Trial Active',
  trialEndingSoon: 'Trial Ending Soon',
  trialExpired: 'Trial Expired',
  pendingReview: 'Payment Pending Review',
  rejected: 'Payment Rejected',
  activeSubscription: 'Subscription Active',
  subscriptionExpired: 'Subscription Expired',
};

function computeSubscriptionState(store) {
  const now = Date.now();
  switch (store.subscriptionStatus) {
    case null:
    case undefined:
      return SubscriptionState.notStarted;
    case 'trial':
      if (!store.trialEndsAt) return SubscriptionState.activeTrial;
      if (store.trialEndsAt.getTime() < now) return SubscriptionState.trialExpired;
      if (store.trialEndsAt.getTime() - now <= 3 * 24 * 60 * 60 * 1000) return SubscriptionState.trialEndingSoon;
      return SubscriptionState.activeTrial;
    case 'pendingReview':
      return SubscriptionState.pendingReview;
    case 'rejected':
      return SubscriptionState.rejected;
    case 'active':
      if (store.subscriptionEndsAt && store.subscriptionEndsAt.getTime() < now) return SubscriptionState.subscriptionExpired;
      return SubscriptionState.activeSubscription;
    default:
      return SubscriptionState.notStarted;
  }
}

export function storeFromMap(map, id) {
  return {
    id,
    name: map.name ?? '',
    ownerName: map.ownerName ?? '',
    category: resolveCategory(map.category),
    billType: map.billType ?? null,
    pabiliType: map.pabiliType ?? null,
    address: map.address ?? '',
    latitude: typeof map.latitude === 'number' ? map.latitude : null,
    longitude: typeof map.longitude === 'number' ? map.longitude : null,
    phoneNumber: map.phoneNumber ?? map.phone ?? '',
    email: map.email ?? null,
    logoUrl: map.logoUrl ?? map.photoUrl ?? null,
    description: map.description ?? null,
    permitPhotoUrl: map.permitPhotoUrl ?? null,
    idPhotoUrl: map.idPhotoUrl ?? null,
    accountStatus: resolveStatus(map.accountStatus),
    rejectionReason: map.rejectionReason ?? null,
    rating: typeof map.rating === 'number' ? map.rating : 0.0,
    totalOrders: typeof map.totalOrders === 'number' ? map.totalOrders : 0,
    createdAt: toDate(map.createdAt, new Date()),
    updatedAt: toDate(map.updatedAt, new Date()),
    subscriptionStatus: map.subscriptionStatus ?? null,
    planId: map.planId ?? null,
    trialStartedAt: toDateOrNull(map.trialStartedAt),
    trialEndsAt: toDateOrNull(map.trialEndsAt),
    subscriptionStartedAt: toDateOrNull(map.subscriptionStartedAt),
    subscriptionEndsAt: toDateOrNull(map.subscriptionEndsAt),
    hasUsedTrial: map.hasUsedTrial ?? false,
    paymentProofUrl: map.paymentProofUrl ?? null,
    subscriptionRejectionReason: map.subscriptionRejectionReason ?? null,
    get isPending() {
      return this.accountStatus === 'Pending';
    },
    get isApproved() {
      return this.accountStatus === 'Approved';
    },
    get isRejected() {
      return this.accountStatus === 'Rejected';
    },
    get isSuspended() {
      return this.accountStatus === 'Suspended';
    },
    get subscriptionState() {
      return computeSubscriptionState(this);
    },
  };
}
