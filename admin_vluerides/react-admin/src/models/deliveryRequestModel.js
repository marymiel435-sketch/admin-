// Mirrors lib/models/delivery_request_model.dart
function toDate(ts, fallback) {
  return ts?.toDate ? ts.toDate() : fallback;
}
function toDateOrNull(ts) {
  return ts?.toDate ? ts.toDate() : null;
}
function toNumOrNull(v) {
  return typeof v === 'number' ? v : null;
}

export const ACTIVE_STATUSES = [
  'searching_rider', 'rider_assigned', 'accepted',
  'arriving', 'picked_up', 'in_transit', 'near_destination',
];
export const COMPLETED_STATUSES = ['delivered', 'completed'];
export const SERVICE_TYPES = ['Pickup', 'Pabili', 'Food Delivery', 'Pay Bills'];

export function deliveryRequestFromMap(map, id) {
  const deliveryFee = toNumOrNull(map.deliveryFee);
  const itemsTotalPrice = toNumOrNull(map.itemsTotalPrice);
  return {
    id,
    customerId: map.customerId ?? '',
    customerName: map.customerName ?? '',
    customerPhone: map.customerPhone ?? '',
    serviceType: map.serviceType ?? 'Pickup',
    pickupAddress: map.pickupAddress ?? '',
    pickupLat: typeof map.pickupLat === 'number' ? map.pickupLat : 0.0,
    pickupLng: typeof map.pickupLng === 'number' ? map.pickupLng : 0.0,
    deliveryAddress: map.deliveryAddress ?? null,
    deliveryLat: toNumOrNull(map.deliveryLat),
    deliveryLng: toNumOrNull(map.deliveryLng),
    itemName: map.itemName ?? map.itemDescription ?? null,
    itemCategory: map.itemCategory ?? map.storeName ?? map.restaurantName ?? null,
    itemSize: map.itemSize ?? null,
    itemWeight: toNumOrNull(map.itemWeight),
    distanceKm: toNumOrNull(map.distanceKm),
    durationMinutes: typeof map.durationMinutes === 'number' ? map.durationMinutes : null,
    deliveryFee,
    itemsTotalPrice,
    notes: map.notes ?? '',
    receiverName: map.receiverName ?? null,
    receiverPhone: map.receiverPhone ?? null,
    paymentMethod: map.paymentMethod ?? null,
    status: map.status ?? 'searching_rider',
    assignedRiderId: map.assignedRiderId ?? null,
    declinedRiderIds: Array.isArray(map.declinedRiderIds) ? map.declinedRiderIds : [],
    riderId: map.riderId ?? null,
    riderName: map.riderName ?? null,
    riderPhone: map.riderPhone ?? null,
    createdAt: toDate(map.createdAt, new Date()),
    updatedAt: toDate(map.updatedAt, new Date()),
    assignedAt: toDateOrNull(map.assignedAt),
    acceptedAt: toDateOrNull(map.acceptedAt),
    deliveredAt: toDateOrNull(map.deliveredAt),
    receiptUrl: map.receiptUrl ?? null,
    customerRating: typeof map.customerRating === 'number' ? map.customerRating : null,
    customerFeedback: map.customerFeedback ?? null,
    get isActive() {
      return ACTIVE_STATUSES.includes(this.status);
    },
    get isCompleted() {
      return this.status === 'delivered' || this.status === 'completed';
    },
    get isCancelled() {
      return this.status === 'cancelled';
    },
    get grandTotal() {
      return (this.deliveryFee ?? 0) + (this.itemsTotalPrice ?? 0);
    },
  };
}
