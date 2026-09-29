import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

import { db } from '../firebase';
import { NotificationItem } from '../models/notificationItem';
import { FirestoreCollections } from '../utils/constants';

function itemsRef(uid) {
  return collection(db, FirestoreCollections.notifications, uid, 'items');
}

export const NotificationService = {
  // Subscribes to a user's notifications (most recent 50); `callback`
  // receives the current NotificationItem[]. Returns an unsubscribe
  // function.
  streamNotifications(uid, callback) {
    const q = query(itemsRef(uid), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => NotificationItem.fromFirestore(d)));
    });
  },

  streamUnreadCount(uid, callback) {
    return this.streamNotifications(uid, (items) => callback(items.filter((n) => !n.read).length));
  },

  markAsRead(uid, notifId) {
    return updateDoc(doc(itemsRef(uid), notifId), { read: true });
  },

  async markAllAsRead(uid, notifIds) {
    const batch = writeBatch(db);
    for (const id of notifIds) {
      batch.update(doc(itemsRef(uid), id), { read: true });
    }
    await batch.commit();
  },

  delete(uid, notifId) {
    return deleteDoc(doc(itemsRef(uid), notifId));
  },
};
