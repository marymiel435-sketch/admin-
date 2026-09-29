# Firestore rules update — store registration fix

**Date:** 2026-07-23
**Problem:** Store registration created the Firebase Auth account but never wrote the
`stores/{uid}` application document, so admins had nothing to review.
**Root cause:** the live rule was `match /stores/{storeId} { allow write: if isAdmin(); }` —
literally no store owner could ever write their own document, admin-only.
**Also found while in here:** there was no rule at all for the `stores/{storeId}/products`
subcollection, which would have blocked every product write once a store got approved.

## What changed

Only the `stores` block changed (split into `create` / `update` / `delete` with guardrails) and a
new `products` block was added. Every other match block (`admins`, `customers`, `riders`,
`delivery_requests`, `live_locations`, `fcm_tokens`, `pending_verifications`, `notifications`,
`rider_notifications`, `delivery_tracks`) is untouched, byte-for-byte identical to what was already
live.

- `create`: a store owner may create their own doc (id must equal their own uid), but only while it
  starts `accountStatus: 'Pending'` and `status: 'inactive'` — matches exactly what the app writes
  on registration, and stops anyone from creating a pre-approved/pre-visible store.
- `update`: a store owner may update their own doc (profile edits, or resubmitting after a
  rejection), but can never touch the mobile-visibility `status` field, and the only `accountStatus`
  transition they can make themselves is back to `'Pending'` — never self-approve or self-unsuspend.
- `delete`: admin-only (unchanged behavior, no delete path in this app).
- `products/{productId}` (new): customers only ever see `available == true` products; the store
  owner sees all of their own (including out-of-stock, for their dashboard); admins see everything.
  Writes are owner-or-admin only.
- `admins` retain full write access to `stores` and `products` regardless of the above, same as
  every other collection in this ruleset.

## How to apply

1. Firebase Console → your project (`vluerides-application-73c49`) → Firestore Database → **Rules**
   tab.
2. Replace the entire contents with the rules below and click **Publish**.
3. Try registering a test store again — the `stores/{uid}` doc should now appear immediately with
   `accountStatus: "Pending"`.

This same text is also saved as [`firestore.rules`](firestore.rules) in the repo, for whenever you
want to deploy via the Firebase CLI instead (`firebase deploy --only firestore:rules`).

## Rules to paste

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if false;
    }

    match /customers/{userId} {
      allow get, create, update, delete: if isAdmin() || isOwner(userId);
      allow list: if true;
    }

    match /riders/{userId} {
      allow get: if isSignedIn();
      allow create, delete: if isAdmin() || isOwner(userId);
      // Owner/admin can update anything; any signed-in user (e.g. a customer
      // submitting a rating) may update only the rider's aggregate rating stats.
      allow update: if isAdmin() || isOwner(userId)
        || (isSignedIn() && request.resource.data.diff(resource.data)
              .affectedKeys().hasOnly(['rating', 'totalDeliveries', 'updatedAt']));
      allow list: if true;
    }

    match /delivery_requests/{requestId} {
      allow create: if isSignedIn()
        && request.resource.data.customerId == request.auth.uid;

      allow get, list: if isAdmin()
        || (isSignedIn() && resource.data.customerId == request.auth.uid)
        || (isSignedIn() && resource.data.riderId == request.auth.uid)
        || (isSignedIn() && resource.data.assignedRiderId == request.auth.uid)
        || isSignedIn();

      allow update: if isAdmin()
        || (isSignedIn() && resource.data.customerId == request.auth.uid)
        || (isSignedIn() && resource.data.riderId == request.auth.uid)
        || (isSignedIn() && resource.data.assignedRiderId == request.auth.uid)
        || isSignedIn();

      allow delete: if isAdmin();
    }

    match /live_locations/{riderId} {
      allow read: if isSignedIn();
      allow write: if isOwner(riderId) || isAdmin();
    }

    match /fcm_tokens/{userId} {
      allow read: if isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }

    match /pending_verifications/{email} {
      allow read, write: if true;
    }

    match /stores/{storeId} {
      allow read: if isSignedIn();

      // A store owner may create their own application (document id must
      // be their own uid). It must start life as Pending / not yet
      // visible to customers — only an admin approval (elsewhere) can
      // ever mark it 'active'/'Approved'.
      allow create: if isAdmin()
        || (isOwner(storeId)
            && request.resource.data.accountStatus == 'Pending'
            && request.resource.data.status == 'inactive');

      // A store owner may update their own doc (profile edits, or
      // resubmitting after a rejection), but can never touch the mobile
      // visibility 'status' field themselves, and the only accountStatus
      // transition they can make on their own is back to 'Pending' —
      // never self-approve or self-unsuspend.
      allow update: if isAdmin()
        || (isOwner(storeId)
            && request.resource.data.status == resource.data.status
            && (request.resource.data.accountStatus == resource.data.accountStatus
                || request.resource.data.accountStatus == 'Pending'));

      allow delete: if isAdmin();

      match /products/{productId} {
        // Customers only ever see available products; the store owner
        // sees all of their own (including out-of-stock items in their
        // dashboard); admins see everything.
        allow read: if resource.data.available == true
          || isOwner(storeId)
          || isAdmin();
        allow write: if isOwner(storeId) || isAdmin();
      }
    }

    match /notifications/{userId}/items/{notifId} {
      // Owner can read, mark as read (update), or delete their own notifications
      allow read, update, delete: if isOwner(userId);
      // Any signed-in user (rider, customer, or admin) can create a notification
      // for another user — needed so riders can notify customers and vice versa
      allow create: if isSignedIn();
    }

    match /rider_notifications/{riderId}/items/{notifId} {
      allow read, update, delete: if isOwner(riderId);
      allow create: if isSignedIn();
    }

    match /delivery_tracks/{requestId} {
      allow read: if isAdmin();
      allow write: if isSignedIn();
    }
  }
}
```

## Still open

The Storage bucket almost certainly has the same admin-only write pattern for permit/store/product
photo uploads. Registration itself won't break because of it (the permit photo upload was made
non-blocking/best-effort in the app), but uploads will silently fail until those rules are fixed
too. Paste the current Storage → Rules tab contents whenever you want that merged the same way.
