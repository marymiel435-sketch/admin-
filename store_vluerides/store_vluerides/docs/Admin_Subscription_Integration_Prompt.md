# Admin-Side Prompt: Store Subscription Feature Integration

> **How to use this file:** copy everything below the line into your admin project's
> AI CLI (Claude Code, etc.) as a single prompt. It's written to be self-contained —
> the admin project's agent has no access to the Store app's codebase or this
> conversation, so everything it needs to know is spelled out here.

---

I need you to add subscription-management to the Vlue Rides **admin panel**. A
companion Flutter app — the **Store dashboard** (a separate codebase from this admin
project) — already implements the store-owner side of a maintenance-subscription
system: a free trial after account approval, then a paid Monthly/Yearly plan. It
reads/writes Firestore directly (no custom backend server exists for this feature —
Firestore + Firestore Security Rules **are** the backend). Your job is to build the
admin side against that same, already-live Firestore schema — don't invent a new one.

Before writing any code: inspect this admin project's actual structure (its
Firebase Auth/Firestore setup, how it already handles store-approval if it does,
its UI framework and existing admin screens/components) and adapt to what's already
there, the same way you would for any other feature. Everything below describes the
**contract** on the Firestore side that already exists and is live in production —
treat it as fixed, not as a suggestion.

## Firebase project

Project id: `vluerides-application-73c49`. This admin app must connect to the
**same** Firebase project (same Firestore database, same Storage bucket) — not a
separate one. If this admin project isn't already wired to that project, that's the
first thing to get right.

## How "admin" is recognized

Firestore Security Rules gate every privileged write with an `isAdmin()` check:

```
function isAdmin() {
  return isSignedIn()
    && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

So: a user is an admin if and only if a document exists at `admins/{their-auth-uid}`
(the document's content doesn't matter, only its existence). `allow write: if false`
on that collection — nobody can create these documents through the client SDK, so
admin accounts must already be provisioned some other way (Firebase Console, or an
Admin SDK script). If you don't already know how this admin project's users get an
`admins/{uid}` doc, ask rather than guessing — don't build a self-service "become an
admin" flow, since the rules deliberately don't allow one.

Whatever this admin app already does for the existing store-approval workflow
(`accountStatus`: Pending/Approved/Rejected/Suspended) uses this exact same
`admins/{uid}` mechanism — subscription management should authenticate the same way.

## The `stores/{uid}` document — subscription fields

Each store is one document at `stores/{uid}` (`uid` = the store owner's Firebase Auth
uid). Alongside the existing profile/approval fields, these are the
subscription-related ones you'll read and write:

| Field | Type | Meaning |
|---|---|---|
| `subscriptionStatus` | `string \| null` | `null` (trial not started yet), `'trial'`, `'pendingReview'`, `'active'`, or `'rejected'` |
| `planId` | `string \| null` | `'trial'`, or one of the ids from `app_config/subscription_plans` (e.g. `'monthly'`, `'yearly'`) |
| `trialStartedAt` | `Timestamp \| null` | Set once, when the trial begins |
| `trialEndsAt` | `Timestamp \| null` | Trial expiry |
| `subscriptionStartedAt` | `Timestamp \| null` | Set when a paid period begins (**admin sets this** — see below) |
| `subscriptionEndsAt` | `Timestamp \| null` | Paid-period expiry (**admin sets this**) |
| `hasUsedTrial` | `bool` | Once `true`, never resettable by the owner — anti-abuse flag |
| `paymentProofUrl` | `string \| null` | A Firebase Storage **download URL** (see note below) for the receipt the owner uploaded |
| `subscriptionRejectionReason` | `string \| null` | Shown to the owner when you reject their payment |

**Important — never trust a computed "is this store active" boolean.** Whether a
store's access should be considered active is always **derived from comparing these
dates to the current time**, never read as a stored flag. The Store app's own source
of truth for this (`lib/models/store.dart`, `Store.subscriptionState`) computes one
of these states — replicate the same logic for your admin list/detail views instead
of inventing your own:

- **`notStarted`** — `subscriptionStatus == null`
- **`activeTrial`** — `subscriptionStatus == 'trial'` and `trialEndsAt` is in the future
- **`trialEndingSoon`** — same as above, but `trialEndsAt` is within 3 days
- **`trialExpired`** — `subscriptionStatus == 'trial'` and `trialEndsAt` has passed
- **`pendingReview`** — `subscriptionStatus == 'pendingReview'` (owner submitted a receipt, awaiting you)
- **`rejected`** — `subscriptionStatus == 'rejected'`
- **`activeSubscription`** — `subscriptionStatus == 'active'` and (`subscriptionEndsAt` is null or in the future)
- **`subscriptionExpired`** — `subscriptionStatus == 'active'` but `subscriptionEndsAt` has passed

A store's dashboard/product-management access is **already enforced server-side**
by Firestore Rules based on exactly this logic (a store owner literally cannot
create/edit products via a direct API call once expired, not just via the app's UI)
— so nothing you build here is required for security. This is purely an admin
visibility/workflow feature.

## Trial length is admin-configurable — `app_config/subscription_plans`

This is the actual feature you're wiring up: **the free-trial length is no longer a
hardcoded number** in the Store app. It's read live from this Firestore document,
which only an admin can write:

```jsonc
// app_config/subscription_plans
{
  "trialDays": 30,           // int — free trial length, in days, for NEWLY STARTED trials
  "plans": [
    { "id": "monthly", "name": "Monthly", "priceLabel": "₱199",   "periodDays": 30 },
    { "id": "yearly",  "name": "Yearly",  "priceLabel": "₱1,999", "periodDays": 365 }
  ]
}
```

Build a simple settings screen where an admin can edit `trialDays` (and, if useful,
the `plans` array's `priceLabel`/`name`/`periodDays`). Just write the merged
document back with the Firestore SDK — the security rule for this path is
`allow write: if isAdmin();`, so any signed-in admin can update it directly, no
special endpoint needed.

**Behavior to get right:** changing `trialDays` only affects trials that start
**after** the change. It is intentionally **not retroactive** — a store already
mid-trial keeps the `trialEndsAt` it was already granted. Don't build anything that
tries to recompute existing stores' trial dates when this setting changes; that
would conflict with how the Store app's Firestore Rules validate trial-start writes
(they check the config value **at the moment the trial is granted**, not
continuously).

If you want to double check the effective value live, it's readable at
`app_config/subscription_plans.trialDays` — this admin app should treat it as
editable data, not duplicate it as a hardcoded constant anywhere on your side either.

## The payment-review workflow (your main new screen)

When an owner submits a receipt, `stores/{uid}` gets updated (by the owner's own
client — this is rules-enforced, they cannot fake other fields) to:
`subscriptionStatus: 'pendingReview'`, `planId: '<their chosen plan>'`,
`paymentProofUrl: '<receipt URL>'`.

Build an admin queue: **query `stores` where `subscriptionStatus == 'pendingReview'`.**
For each one, show the store name, chosen plan, and the receipt image —
just render `paymentProofUrl` directly as an `<img>`/`Image.network` source. It's
already a self-authorizing Firebase Storage download URL (it has an access token
baked into the URL itself), so you do **not** need any special Storage read
permission to view it — don't try to re-derive the storage path via the Storage SDK
directly, since the raw `subscription_proofs/{uid}/...` path in Storage Rules is
still restricted to that store's own owner.

Two actions:

**Approve** — write to `stores/{uid}`:
```js
{
  subscriptionStatus: 'active',
  subscriptionStartedAt: serverTimestamp(),
  subscriptionEndsAt: Timestamp.fromDate(new Date(now + plan.periodDays * 86400000)),
  subscriptionRejectionReason: null,
  updatedAt: serverTimestamp(),
}
```
Look up `plan.periodDays` from the matching entry in `app_config/subscription_plans.plans`
by the store's `planId`, so the expiry matches whatever plan they actually paid for.

**Reject** — write to `stores/{uid}`:
```js
{
  subscriptionStatus: 'rejected',
  subscriptionRejectionReason: '<why — shown verbatim to the owner>',
  updatedAt: serverTimestamp(),
}
```

Both writes are only possible because you're an admin — `isAdmin()` bypasses every
other constraint in the rules, so **your app is the only safety net** on these
writes actually being sane (e.g. don't let an admin set `subscriptionStatus` to a
typo'd string, don't let them approve without a valid `planId`). The rules trust
admins completely here, matching how this project already treats store-approval.

## What you do *not* need to build

- **Starting trials.** The Store app itself auto-starts a store's trial the moment
  you approve their account (`accountStatus: 'Approved'`) — that's already wired up
  and reads the live `trialDays` config automatically. You never manually start a
  trial.
- **Anti-repeat-trial logic.** There's a `trial_registry/{email}` collection
  (admin-read-only, keyed by the owner's Firebase-Auth-verified email) that already
  prevents a store from getting a second free trial by deleting their account and
  re-registering. You don't need to touch it — it's there for your visibility if you
  ever want to audit it, not for you to manage.
- **Any payment gateway.** There isn't one yet on either side. The "Approve" action
  above is the entire "payment processing" — a human admin manually verifying a
  receipt screenshot. Don't build or fake real payment processing.
- **Enforcing the gate.** As noted above, product-management access is already
  denied server-side once a store's trial/subscription has expired, independent of
  anything in this admin app.

## Manual testing / dev-simulation for you

To simulate an expired subscription for a specific store while testing your admin
UI, you (as admin) can write directly:
```js
{ subscriptionEndsAt: Timestamp.fromDate(pastDate), updatedAt: serverTimestamp() }
```
That's a legitimate admin write (bypasses the owner-only transition rules) and is a
handy way to manufacture a `subscriptionExpired`/`trialExpired` store to test your
queue and status views against, without waiting for a real 30-day period.

---

If anything above doesn't match what you find in this admin project's actual code
(e.g. a different way of determining admin users, an existing store-list screen you
should extend rather than duplicate), follow what's actually there and flag the
discrepancy back to me rather than guessing.
