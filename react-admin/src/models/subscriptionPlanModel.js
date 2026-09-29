// Mirrors lib/models/subscription_plan_model.dart
export function subscriptionPlanFromMap(map) {
  const priceLabel = map.priceLabel ?? '';
  const storedPrice = typeof map.price === 'number' ? map.price : 0;
  return {
    id: map.id ?? '',
    name: map.name ?? '',
    priceLabel,
    periodDays: typeof map.periodDays === 'number' ? map.periodDays : 30,
    // Plans saved before the numeric `price` field existed (or a doc edited
    // by hand in the Firestore console) have no usable amount, which
    // otherwise logs every approved payment at ₱0. Fall back to digits
    // parsed out of the display label (e.g. "₱199" -> 199).
    price: storedPrice > 0 ? storedPrice : parseFloat(String(priceLabel).replace(/[^0-9.]/g, '')) || 0,
  };
}

export function subscriptionPlanToMap(plan) {
  return { id: plan.id, name: plan.name, priceLabel: plan.priceLabel, periodDays: plan.periodDays, price: plan.price };
}

export function paymentMethodFromMap(map) {
  return {
    id: map.id ?? '',
    label: map.label ?? '',
    accountNumber: map.accountNumber ?? '',
    accountName: map.accountName ?? '',
  };
}

export function paymentMethodToMap(m) {
  return { id: m.id, label: m.label, accountNumber: m.accountNumber, accountName: m.accountName };
}

export const DEFAULT_SUBSCRIPTION_PLANS_CONFIG = {
  trialDays: 30,
  plans: [
    { id: 'monthly', name: 'Monthly', priceLabel: '₱199', periodDays: 30, price: 199 },
    { id: 'yearly', name: 'Yearly', priceLabel: '₱1,999', periodDays: 365, price: 1999 },
  ],
  paymentMethods: [],
};

export function subscriptionPlansConfigFromMap(map) {
  const rawPlans = Array.isArray(map.plans) ? map.plans : [];
  const plans = rawPlans.map(subscriptionPlanFromMap);
  const rawMethods = Array.isArray(map.paymentMethods) ? map.paymentMethods : [];
  const paymentMethods = rawMethods.map(paymentMethodFromMap);
  return {
    trialDays: typeof map.trialDays === 'number' ? map.trialDays : DEFAULT_SUBSCRIPTION_PLANS_CONFIG.trialDays,
    plans: plans.length === 0 ? DEFAULT_SUBSCRIPTION_PLANS_CONFIG.plans : plans,
    paymentMethods,
  };
}

export function subscriptionPlansConfigToMap(config) {
  return {
    trialDays: config.trialDays,
    plans: config.plans.map(subscriptionPlanToMap),
    paymentMethods: config.paymentMethods.map(paymentMethodToMap),
  };
}

export function planById(config, id) {
  if (id == null) return null;
  return config.plans.find((p) => p.id === id) ?? null;
}
