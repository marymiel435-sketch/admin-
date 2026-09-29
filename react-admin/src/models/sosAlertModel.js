// Mirrors lib/models/sos_alert_model.dart — defensive/normalizing since SOS
// documents may use several different field spellings depending on which
// app version wrote them.
function dateFrom(value) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function sosAlertFromMap(map, id) {
  const location = map.location;
  const locationMap = location && typeof location === 'object' && !location.latitude ? location : null;
  const geoPoint = location && typeof location.latitude === 'number' ? location : null;

  const status = String(map.status ?? '');
  const resolved = map.resolved === true || map.isResolved === true || status.toLowerCase() === 'resolved';
  const active =
    map.active === true ||
    map.isActive === true ||
    map.sosActive === true ||
    (!resolved && status.toLowerCase() !== 'cancelled');

  return {
    id,
    riderId: String(map.riderId ?? map.riderUid ?? map.uid ?? map.userId ?? map.rider_id ?? ''),
    riderName: String(map.riderName ?? map.fullName ?? map.name ?? map.rider_name ?? ''),
    phoneNumber: String(map.phoneNumber ?? map.phone ?? map.riderPhone ?? ''),
    specificAddress: String(map.specificAddress ?? map.address ?? map.homeAddress ?? map.riderAddress ?? ''),
    latitude: typeof map.latitude === 'number' ? map.latitude : (locationMap?.latitude ?? geoPoint?.latitude ?? null),
    longitude: typeof map.longitude === 'number' ? map.longitude : (locationMap?.longitude ?? geoPoint?.longitude ?? null),
    note: map.note ?? map.sosNote ?? map.message ?? null,
    status: status || (active ? 'active' : 'resolved'),
    active,
    createdAt: dateFrom(map.createdAt ?? map.sosAt ?? map.timestamp ?? map.triggeredAt) ?? new Date(),
    resolvedAt: dateFrom(map.resolvedAt),
  };
}
