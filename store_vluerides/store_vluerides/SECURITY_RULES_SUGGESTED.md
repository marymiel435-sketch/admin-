# Firestore & Storage security rules

## Firestore — done, see `firestore.rules`

The original draft below has been superseded. I got the actual currently-deployed ruleset from you
(2026-07-23) and merged the `stores`/`products` permissions into it directly — see
[`firestore.rules`](firestore.rules) in the repo root, which is now a byte-for-byte match of your
live rules except for the `stores` block (split into `create`/`update`/`delete` with guardrails so
an owner can create/edit their own application but never self-approve or flip mobile visibility) and
a new `products` subcollection block (previously had no rule at all, which would have blocked every
product write once a store got approved). That's the file to paste into Firebase Console → Firestore
Database → Rules.

## Storage (`storage.rules`) — still just a draft, not yet merged against your real rules

These are **not applied automatically** — same reasoning as above applied to Firestore: merge into
whatever Storage rules actually exist on the live project before pasting, don't blindly overwrite.
Paste your current Storage → Rules tab contents and I'll merge these in properly, the same way I did
for Firestore.

## Storage (`storage.rules`)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /permits/{uid}/{fileName} {
      // Permit/ID photos are sensitive — owner can read/write their own,
      // no public read. Widen this if an admin review UI (elsewhere)
      // needs to read them under a different auth context/service account.
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /stores/{uid}/profile/{fileName} {
      allow read: if true; // store photo shown to customers
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /stores/{storeId}/products/{productId}/{fileName} {
      allow read: if true; // product photos shown to customers
      allow write: if request.auth != null && request.auth.uid == storeId;
    }
  }
}
```

## CORS for web uploads (`cors.json`)

The Storage bucket has so far only served native mobile SDKs, which don't need CORS. Flutter web's
`firebase_storage` calls the bucket over REST from the browser, so without a CORS config, uploads
from this app will fail with a browser-side CORS error even though Auth/Firestore work fine. Apply
via `gsutil cors set cors.json gs://vluerides-application-73c49.firebasestorage.app` (or the
equivalent in Cloud Console → Storage → Bucket → Permissions/CORS):

```json
[
  {
    "origin": ["http://localhost:8080", "https://YOUR-PROD-HOSTING-DOMAIN"],
    "method": ["GET", "PUT", "POST", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-*"]
  }
]
```

Replace the origins with your actual dev port and production hosting domain once you deploy (e.g.
Firebase Hosting's `*.web.app`/`*.firebaseapp.com` URL or a custom domain).
