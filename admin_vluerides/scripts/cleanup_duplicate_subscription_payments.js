#!/usr/bin/env node
/**
 * One-off cleanup: removes duplicate `subscription_payments` docs created by
 * repeated "Approve" clicks before approveSubscription() was made a
 * transaction (see firestore_service.dart). Each duplicate tap used to add a
 * brand-new payment record for the same approval, inflating Total Revenue
 * without a matching second subscriber.
 *
 * A duplicate = same storeId + planId + amount, approved within
 * DUPLICATE_WINDOW_MS of an earlier kept record for that store. Within each
 * such cluster, the EARLIEST record is kept and the rest are deleted — a
 * genuine re-subscription later (next billing period) is weeks/months away
 * and will never fall inside the window, so it's never touched.
 *
 * Usage (run from the `scripts/` folder):
 *   npm install
 *   node cleanup_duplicate_subscription_payments.js            # dry run — only prints what it would delete
 *   node cleanup_duplicate_subscription_payments.js --apply    # actually deletes the duplicates
 *   node cleanup_duplicate_subscription_payments.js --list     # prints EVERY payment record, grouped by
 *                                                               # store, with no filtering — use this when
 *                                                               # the duplicate/amount math still looks off
 *                                                               # after a cleanup run, to see the raw data
 *                                                               # driving Total Revenue.
 *
 * Requires a service account key (this is what authorizes the script to
 * read/write your live Firestore data — treat it like a password):
 *   1. Firebase Console -> Project Settings -> Service Accounts
 *      -> Generate new private key (downloads a .json file)
 *   2. Save that file OUTSIDE this repo (never commit it)
 *   3. Point the script at it before running, e.g. in PowerShell:
 *        $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\your-key.json"
 */

const admin = require('firebase-admin');

const DUPLICATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const apply = process.argv.includes('--apply');
const listOnly = process.argv.includes('--list');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'GOOGLE_APPLICATION_CREDENTIALS is not set.\n' +
      'PowerShell:  $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\path\\to\\your-service-account-key.json"\n' +
      'See the comment at the top of this script for how to get that key.'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function main() {
  const snap = await db
    .collection('subscription_payments')
    .orderBy('approvedAt', 'asc')
    .get();

  const byStore = new Map();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.storeId || !data.approvedAt) continue;
    if (!byStore.has(data.storeId)) byStore.set(data.storeId, []);
    byStore.get(data.storeId).push({ id: doc.id, ...data });
  }

  const grandTotal = snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

  if (listOnly) {
    console.log(`${snap.docs.length} total payment record(s) across ${byStore.size} store(s). Sum = ₱${grandTotal.toFixed(2)}\n`);
    for (const [storeId, records] of byStore) {
      records.sort((a, b) => a.approvedAt.toMillis() - b.approvedAt.toMillis());
      const storeSum = records.reduce((s, r) => s + (r.amount || 0), 0);
      console.log(`Store ${storeId} — "${records[0].storeName || '?'}" — ${records.length} record(s), ₱${storeSum.toFixed(2)} total`);
      for (const r of records) {
        console.log(
          `    [${r.id}] plan=${r.planId}/${r.planName} amount=${r.amount} approvedAt=${r.approvedAt.toDate().toISOString()}`
        );
      }
    }
    return;
  }

  const toDelete = [];
  let totalDuplicateAmount = 0;

  for (const records of byStore.values()) {
    records.sort((a, b) => a.approvedAt.toMillis() - b.approvedAt.toMillis());
    let lastKept = records[0];
    for (let i = 1; i < records.length; i++) {
      const r = records[i];
      const gapMs = r.approvedAt.toMillis() - lastKept.approvedAt.toMillis();
      const sameCharge = r.planId === lastKept.planId && r.amount === lastKept.amount;
      if (sameCharge && gapMs <= DUPLICATE_WINDOW_MS) {
        toDelete.push(r);
        totalDuplicateAmount += r.amount || 0;
        // Compare the next record against lastKept (not r), so a burst of
        // several rapid clicks all collapse onto the first one instead of
        // chaining forward and drifting outside the window.
      } else {
        lastKept = r;
      }
    }
  }

  if (toDelete.length === 0) {
    console.log('No duplicate subscription_payments records found. Nothing to do.');
    return;
  }

  console.log(
    `Found ${toDelete.length} duplicate payment record(s), totaling ` +
      `₱${totalDuplicateAmount.toFixed(2)} of inflated revenue:\n`
  );
  for (const r of toDelete) {
    console.log(
      `  [${r.id}] store="${r.storeName || r.storeId}" plan=${r.planName} ` +
        `amount=${r.amount} approvedAt=${r.approvedAt.toDate().toISOString()}`
    );
  }

  if (!apply) {
    console.log('\nDry run only — nothing deleted. Re-run with --apply to delete these records.');
    return;
  }

  const batchSize = 400; // stay under Firestore's 500-write batch limit
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = db.batch();
    for (const r of toDelete.slice(i, i + batchSize)) {
      batch.delete(db.collection('subscription_payments').doc(r.id));
    }
    await batch.commit();
  }
  console.log(`\nDeleted ${toDelete.length} duplicate record(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
