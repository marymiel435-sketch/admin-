// A purchasable maintenance-subscription plan, as configured in
// `app_config/subscription_plans` (mirrors the `app_config/pabili_categories`
// pattern used for Pabili registration options — admin-editable in Firestore,
// no app redeploy needed to change pricing).
export class SubscriptionPlanInfo {
  constructor({ id, name, priceLabel, periodDays }) {
    this.id = id;
    this.name = name;
    this.priceLabel = priceLabel;
    this.periodDays = periodDays;
  }

  static fromMap(map) {
    return new SubscriptionPlanInfo({
      id: String(map.id ?? ''),
      name: String(map.name ?? ''),
      priceLabel: String(map.priceLabel ?? ''),
      periodDays: typeof map.periodDays === 'number' ? Math.trunc(map.periodDays) : 30,
    });
  }
}

// An admin-configured account (GCash, PayMaya, bank, etc.) that store
// owners should send subscription payments to, as configured in
// `app_config/subscription_plans.paymentMethods` — purely informational
// display, no payment processing happens in this app.
export class PaymentMethodInfo {
  constructor({ id, label, accountNumber, accountName }) {
    this.id = id;
    this.label = label;
    this.accountNumber = accountNumber;
    // May be empty — not every payment method has an account holder name
    // worth showing (e.g. a bank account number is often self-explanatory).
    this.accountName = accountName;
  }

  static fromMap(map) {
    return new PaymentMethodInfo({
      id: String(map.id ?? ''),
      label: String(map.label ?? ''),
      accountNumber: String(map.accountNumber ?? ''),
      accountName: String(map.accountName ?? ''),
    });
  }
}

// The full `app_config/subscription_plans` doc: paid plans, the
// admin-configurable free-trial length (trialDays), and the accounts
// (paymentMethods) store owners should pay into — all set by an admin
// (e.g. via the Firebase Console, or an admin tool), never by the store
// app itself. See `storeService.fetchSubscriptionConfig`.
export class SubscriptionConfig {
  constructor({ trialDays, plans, paymentMethods = [] }) {
    this.trialDays = trialDays;
    this.plans = plans;
    this.paymentMethods = paymentMethods;
  }
}
