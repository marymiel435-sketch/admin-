import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

import { TrentoLocations } from '../../data/trentoLocations';

const PIN_ICON = L.divIcon({
  className: 'vr-map-pin',
  html:
    '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="#D32F2F" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>' +
    '<circle cx="12" cy="9" r="2.5" fill="#fff"/>' +
    '</svg>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function ClickHandler({ onTap }) {
  useMapEvents({
    click(e) {
      onTap(e.latlng);
    },
  });
  return null;
}

// Interactive OpenStreetMap view used to fine-tune a store's exact pin
// after a purok is selected. Panning/zooming is constrained to Trento
// municipality — this app only serves stores within Trento.
export default function OsmMapWidget({ center, onTap, mapRef }) {
  const bounds = [
    [TrentoLocations.bounds.south, TrentoLocations.bounds.west],
    [TrentoLocations.bounds.north, TrentoLocations.bounds.east],
  ];

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', height: '100%', width: '100%' }}>
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={15}
        minZoom={11}
        maxZoom={18}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
        <Marker position={[center.lat, center.lng]} icon={PIN_ICON} />
        <ClickHandler onTap={onTap} />
      </MapContainer>
    </div>
  );
}
