const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

async function assertIsAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be signed in."
    );
  }
  const adminDoc = await admin
    .firestore()
    .collection("admins")
    .doc(context.auth.uid)
    .get();
  if (!adminDoc.exists || adminDoc.data().role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can do this."
    );
  }
}

// Deletes an Auth user by uid, tolerating one that's already gone (or never
// existed — e.g. a legacy record created before this account had a login).
// Any other failure still surfaces, since the caller's Firestore doc is
// already deleted by that point and should know if the Auth side didn't
// actually clean up.
async function deleteAuthUserIfPresent(uid) {
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    if (err.code !== "auth/user-not-found") {
      throw new functions.https.HttpsError("internal", err.message);
    }
  }
}

// Deletes every Storage object whose path starts with `prefix` — used both
// for folder-style paths ("stores/{storeId}/", which also sweeps up the
// nested products/{productId}/ photos underneath it) and for flat
// "{uid}.ext" avatar files via a prefix ending in the uid + ".". Resolves
// quietly if nothing matches; bucket.deleteFiles() doesn't error on an
// empty prefix.
async function deleteStorageByPrefix(prefix) {
  await admin.storage().bucket().deleteFiles({ prefix });
}

// Deletes every subscription_payments doc for a store (its revenue-ledger
// entries, including any 'backfill_{storeId}' record) — run as part of
// deleteStoreAccount so a deleted store leaves no orphaned subscription
// documents behind. Batched delete since a store may have more than one
// payment record over its lifetime.
async function deleteSubscriptionPaymentsForStore(storeId) {
  const snap = await admin
    .firestore()
    .collection("subscription_payments")
    .where("storeId", "==", storeId)
    .get();
  if (snap.empty) return;
  const batch = admin.firestore().batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

// Deletes a store's account entirely: its Firestore doc AND everything
// nested under it (the stores/{storeId}/products subcollection — the store's
// product listings, which the client SDK never removes on its own when a
// parent doc is deleted), its subscription payment records, every Storage
// image tied to it (logo + product photos under "stores/{storeId}/",
// business permit under "permits/{storeId}/", and its "profile_pictures/"
// avatar if it uploaded one), AND its Firebase Auth user. The client Auth
// SDK can only ever delete the *signed-in* user's own account, never
// another user's by UID — that requires the Admin SDK, which only runs in
// a trusted backend like this function.
exports.deleteStoreAccount = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    await assertIsAdmin(context);

    const storeId = data && data.storeId;
    if (!storeId || typeof storeId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "storeId is required."
      );
    }

    await admin
      .firestore()
      .recursiveDelete(admin.firestore().collection("stores").doc(storeId));
    await deleteSubscriptionPaymentsForStore(storeId);
    await Promise.all([
      deleteStorageByPrefix(`stores/${storeId}/`),
      deleteStorageByPrefix(`permits/${storeId}/`),
      deleteStorageByPrefix(`profile_pictures/${storeId}.`),
    ]);
    await deleteAuthUserIfPresent(storeId);

    return { success: true };
  });

// Same as deleteStoreAccount, for riders/{uid} — also removes its Storage
// images: documents under "rider_documents/{riderId}/", its
// "profile_pictures/" avatar, and any generated reports under
// "reports/{riderId}/".
exports.deleteRiderAccount = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    await assertIsAdmin(context);

    const riderId = data && data.riderId;
    if (!riderId || typeof riderId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "riderId is required."
      );
    }

    await admin.firestore().collection("riders").doc(riderId).delete();
    await Promise.all([
      deleteStorageByPrefix(`rider_documents/${riderId}/`),
      deleteStorageByPrefix(`profile_pictures/${riderId}.`),
      deleteStorageByPrefix(`reports/${riderId}/`),
    ]);
    await deleteAuthUserIfPresent(riderId);

    return { success: true };
  });

// Same as deleteStoreAccount/deleteRiderAccount, for customers/{uid}. A
// customer only has one Storage asset (its "profile_pictures/" avatar) and
// no subscription ledger of its own, so there's nothing else to sweep up.
exports.deleteCustomerAccount = functions
  .region("asia-southeast1")
  .https.onCall(async (data, context) => {
    await assertIsAdmin(context);

    const customerId = data && data.customerId;
    if (!customerId || typeof customerId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "customerId is required."
      );
    }

    await admin.firestore().collection("customers").doc(customerId).delete();
    await deleteStorageByPrefix(`profile_pictures/${customerId}.`);
    await deleteAuthUserIfPresent(customerId);

    return { success: true };
  });
