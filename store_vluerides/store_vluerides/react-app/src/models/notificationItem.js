// A single entry from `notifications/{uid}/items/{notifId}` (see
// `firestore.rules`). That collection is shared platform-wide — riders,
// customers, and other clients can all write into a user's notification
// list — so field names are read tolerantly rather than assuming this app
// is the only producer.
export class NotificationItem {
  constructor({ id, title, body, read, createdAt = null }) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.read = read;
    this.createdAt = createdAt;
  }

  static fromFirestore(docSnap) {
    const data = docSnap.data();
    return new NotificationItem({
      id: docSnap.id,
      title: data.title ?? data.heading ?? 'Notification',
      body: data.body ?? data.message ?? data.text ?? '',
      read: data.read ?? data.isRead ?? false,
      createdAt: data.createdAt?.toDate?.() ?? null,
    });
  }
}
