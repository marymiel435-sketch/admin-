import L from 'leaflet';
import { AppColors } from '../theme/colors';

// A Material-style "location_on" pin as a Leaflet divIcon, avoiding the
// well-known Leaflet + bundler default-marker-image path problem entirely
// (no image asset resolution needed).
export function pinIcon(color = AppColors.primary, size = 40) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}
