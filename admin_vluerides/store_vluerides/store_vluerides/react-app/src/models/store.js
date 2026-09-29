import { SubscriptionPlan, SubscriptionStatus } from '../utils/constants';

// Derived, display-ready phase of a store's maintenance subscription —
// computed purely from the stored status/dates vs. "now". This is the one
// place that interprets those fields; screens and the router gate should
// read this instead of re-deriving their own booleans.
export const SubscriptionState = {
  // subscriptionStatus is still null — trial hasn't been started yet (the
  // brief window right after approval before the client-side write lands).
  // Never gated.
  notStarted: 'notStarted',
  activeTrial: 'activeTrial',
  // Still trialing, but trialDaysLeft is low enough to warn about.
  trialEndingSoon: 'trialEndingSoon',
  trialExpired: 'trialExpired',
  pendingReview: 'pendingReview',
  rejected: 'rejected',
  activeSubscription: 'activeSubscription',
  subscriptionExpired: 'subscriptionExpired',
};

export class Store {
  constructor({
    uid,
    storeName,
    category,
    billType = null,
    pabiliCategory = null,
    address,
    barangay = null,
    purok = null,
    latitude,
    longitude,
    status,
    accountStatus,
    isOpen = true,
    rejectionReason = null,
    ownerName,
    phone,
    email,
    permitPhotoUrl = null,
    photoUrl = null,
    hours = null,
    productCategories = [],
    createdAt = null,
    updatedAt = null,
    subscriptionStatus = null,
    planId = null,
    trialStartedAt = null,
    trialEndsAt = null,
    subscriptionStartedAt = null,
    subscriptionEndsAt = null,
    hasUsedTrial = false,
    paymentProofUrl = null,
    subscriptionRejectionReason = null,
  }) {
    this.uid = uid;
    this.storeName = storeName;
    this.category = category;
    this.billType = billType;
    // Chosen from the admin-managed `app_config/pabili_categories` list at
    // registration when `category` is Pabili Store — distinct from
    // `productCategories`, which the owner curates themselves afterward.
    this.pabiliCategory = pabiliCategory;
    this.address = address;
    this.barangay = barangay;
    this.purok = purok;
    this.latitude = latitude;
    this.longitude = longitude;
    this.status = status;
    this.accountStatus = accountStatus;
    // Day-to-day availability the owner toggles themselves (e.g. closed for
    // the night, on a break) — distinct from status/accountStatus, which
    // are the admin-controlled approval/visibility fields.
    this.isOpen = isOpen;
    this.rejectionReason = rejectionReason;
    this.ownerName = ownerName;
    this.phone = phone;
    this.email = email;
    this.permitPhotoUrl = permitPhotoUrl;
    this.photoUrl = photoUrl;
    this.hours = hours;
    // Product categories the owner has defined for organizing their own
    // catalog (e.g. "Main Dish", "Drinks") — distinct from `category`,
    // which is the store's overall business type chosen at registration.
    this.productCategories = productCategories;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    // `null` until the trial has been started; otherwise one of the four
    // SubscriptionStatus values.
    this.subscriptionStatus = subscriptionStatus;
    // The plan this status refers to — 'trial', or one of the ids from
    // `app_config/subscription_plans` once a paid plan has been
    // selected/activated.
    this.planId = planId;
    this.trialStartedAt = trialStartedAt;
    this.trialEndsAt = trialEndsAt;
    this.subscriptionStartedAt = subscriptionStartedAt;
    this.subscriptionEndsAt = subscriptionEndsAt;
    // Set once, server-validated, and never reset — the source of truth
    // for "this store already had its one free trial".
    this.hasUsedTrial = hasUsedTrial;
    this.paymentProofUrl = paymentProofUrl;
    this.subscriptionRejectionReason = subscriptionRejectionReason;
  }

  get isTrialing() {
    return this.trialEndsAt != null && this.trialEndsAt.getTime() > Date.now();
  }

  get isSubscriptionActive() {
    return (
      this.subscriptionStatus === SubscriptionStatus.active &&
      (this.subscriptionEndsAt == null || this.subscriptionEndsAt.getTime() > Date.now())
    );
  }

  get isPaymentPendingReview() {
    return this.subscriptionStatus === SubscriptionStatus.pendingReview;
  }

  // Whole days left in the trial, rounded up so "a few hours left" still
  // reads as 1 rather than 0.
  get trialDaysLeft() {
    if (this.trialEndsAt == null) return 0;
    const diffMs = this.trialEndsAt.getTime() - Date.now();
    if (diffMs < 0) return 0;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return Math.floor(hours / 24) + (hours % 24 > 0 ? 1 : 0);
  }

  // Whole days left in a paid subscription period, same rounding as
  // trialDaysLeft. `null` end date reads as "no countdown", so this
  // returns 0.
  get subscriptionDaysLeft() {
    if (this.subscriptionEndsAt == null) return 0;
    const diffMs = this.subscriptionEndsAt.getTime() - Date.now();
    if (diffMs < 0) return 0;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return Math.floor(hours / 24) + (hours % 24 > 0 ? 1 : 0);
  }

  // The single source of truth for how to describe/gate a store's
  // subscription — everything else (status card, dashboard banner,
  // subscriptionGateActive) should read this instead of re-deriving its
  // own booleans from the raw fields.
  get subscriptionState() {
    if (this.subscriptionStatus == null) return SubscriptionState.notStarted;
    if (this.isPaymentPendingReview) return SubscriptionState.pendingReview;
    if (this.subscriptionStatus === SubscriptionStatus.rejected) return SubscriptionState.rejected;
    if (this.subscriptionStatus === SubscriptionStatus.trial) {
      if (!this.isTrialing) return SubscriptionState.trialExpired;
      return this.trialDaysLeft <= SubscriptionPlan.trialEndingSoonDays
        ? SubscriptionState.trialEndingSoon
        : SubscriptionState.activeTrial;
    }
    // subscriptionStatus === 'active'
    return this.isSubscriptionActive ? SubscriptionState.activeSubscription : SubscriptionState.subscriptionExpired;
  }

  // True once the owner must pay before continuing to use the dashboard.
  get subscriptionGateActive() {
    return (
      this.subscriptionState === SubscriptionState.trialExpired ||
      this.subscriptionState === SubscriptionState.subscriptionExpired ||
      this.isLapsedAwaitingReview
    );
  }

  // Payment proof submitted after the trial/paid period already ended: the
  // owner stays on the Subscription page until an admin approves it. An
  // early renewal (period still running) is not gated.
  get isLapsedAwaitingReview() {
    if (!this.isPaymentPendingReview) return false;
    const periodEnd = this.subscriptionEndsAt ?? this.trialEndsAt;
    return periodEnd == null || periodEnd.getTime() <= Date.now();
  }

  static fromFirestore(docSnap) {
    const data = docSnap.data();
    return new Store({
      uid: docSnap.id,
      storeName: data.storeName ?? data.name ?? data.businessName ?? '',
      category: data.category ?? '',
      billType: data.billType ?? null,
      pabiliCategory: data.pabiliCategory ?? null,
      address: data.address ?? '',
      barangay: data.barangay ?? null,
      purok: data.purok ?? null,
      latitude: Number(data.latitude ?? 0),
      longitude: Number(data.longitude ?? 0),
      status: data.status ?? 'inactive',
      accountStatus: data.accountStatus ?? 'Pending',
      isOpen: data.isOpen ?? true,
      rejectionReason: data.rejectionReason ?? null,
      ownerName: data.ownerName ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      permitPhotoUrl: data.permitPhotoUrl ?? null,
      photoUrl: data.photoUrl ?? null,
      hours: data.hours ?? null,
      productCategories: Array.isArray(data.productCategories) ? data.productCategories.map(String) : [],
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
      subscriptionStatus: data.subscriptionStatus ?? null,
      planId: data.planId ?? null,
      trialStartedAt: data.trialStartedAt?.toDate?.() ?? null,
      trialEndsAt: data.trialEndsAt?.toDate?.() ?? null,
      subscriptionStartedAt: data.subscriptionStartedAt?.toDate?.() ?? null,
      subscriptionEndsAt: data.subscriptionEndsAt?.toDate?.() ?? null,
      hasUsedTrial: data.hasUsedTrial ?? false,
      paymentProofUrl: data.paymentProofUrl ?? null,
      subscriptionRejectionReason: data.subscriptionRejectionReason ?? null,
    });
  }
}
