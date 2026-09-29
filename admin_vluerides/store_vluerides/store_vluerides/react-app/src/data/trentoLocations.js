import { Purok } from '../models/purok';

// Static Trento (Agusan del Sur) municipality data — the 176 puroks across
// its 16 barangays, sourced from the municipality's own purok coordinate
// records and shipped as a bundled asset (public/data/trento_puroks.json)
// rather than looked up over the network. This app is scoped to Trento
// only, so this is the single source of truth for location selection.

let cache = null;

async function load() {
  if (cache != null) return cache;

  const res = await fetch(`${import.meta.env.BASE_URL}data/trento_puroks.json`);
  const data = await res.json();

  const list = [];
  for (const barangay of Object.keys(data)) {
    for (const entry of data[barangay]) {
      list.push(
        new Purok({
          barangay,
          purok: entry.purok,
          latitude: Number(entry.lat),
          longitude: Number(entry.lng),
        })
      );
    }
  }
  list.sort((a, b) => {
    const byBarangay = a.barangay.localeCompare(b.barangay);
    return byBarangay !== 0 ? byBarangay : a.purok.localeCompare(b.purok);
  });

  cache = list;
  return list;
}

// Nearest known purok to a given point — used to best-effort prefill the
// picker's search text when editing a store that already has a pin.
function nearestTo(puroks, lat, lng) {
  if (puroks.length === 0) return null;
  let nearest = null;
  let bestDistanceSquared = Infinity;
  for (const p of puroks) {
    const dLat = p.latitude - lat;
    const dLng = p.longitude - lng;
    const distanceSquared = dLat * dLat + dLng * dLng;
    if (distanceSquared < bestDistanceSquared) {
      bestDistanceSquared = distanceSquared;
      nearest = p;
    }
  }
  return nearest;
}

// Approximate municipal boundary (with a small buffer), used both to
// center the map on first load and to constrain panning/zooming so the
// picker can't be dragged outside Trento.
const bounds = {
  south: 7.92,
  west: 125.97,
  north: 8.19,
  east: 126.31,
};

const center = { lat: 8.039526, lng: 126.102243 };

function clampLatitude(lat) {
  return Math.min(Math.max(lat, bounds.south), bounds.north);
}

function clampLongitude(lng) {
  return Math.max(bounds.west, Math.min(bounds.east, lng));
}

export const TrentoLocations = { load, nearestTo, bounds, center, clampLatitude, clampLongitude };
