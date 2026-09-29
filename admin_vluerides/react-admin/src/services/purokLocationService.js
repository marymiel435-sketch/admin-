import trentoPuroks from '../data/trentoPuroks.json';

// Mirrors lib/services/purok_location_service.dart. Unlike the Dart version
// (which async-loads a bundled asset via rootBundle), the JSON is just
// imported directly — no load-once ceremony needed.
export const DEFAULT_LAT = 8.0503;
export const DEFAULT_LNG = 126.0618;

const byBarangay = {};
const all = [];
for (const [barangay, puroks] of Object.entries(trentoPuroks)) {
  const list = puroks.map((p) => ({
    purok: p.purok,
    barangay,
    latitude: p.lat,
    longitude: p.lng,
  }));
  byBarangay[barangay] = list;
  all.push(...list);
}

export function readableAddress(location) {
  return `${location.purok}, Barangay ${location.barangay}, Trento, Agusan del Sur`;
}

export function getBarangays() {
  return Object.keys(byBarangay).sort();
}

export function puroksInBarangay(barangay) {
  return byBarangay[barangay] ?? [];
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371.0;
  const dLat = degToRad(lat2 - lat1);
  const dLng = degToRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

// Finds the purok whose stored coordinates are closest to lat/lng.
export function findNearest(lat, lng) {
  if (all.length === 0) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const p of all) {
    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = p;
    }
  }
  return nearest;
}

// A human-readable address derived from raw coordinates, e.g.
// "Near Purok-4, Barangay Poblacion, Trento, Agusan del Sur".
export function readableAddressFor(lat, lng) {
  const nearest = findNearest(lat, lng);
  if (!nearest) return 'Trento, Agusan del Sur';
  return `Near ${readableAddress(nearest)}`;
}
