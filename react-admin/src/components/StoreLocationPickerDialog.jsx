import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { AppColors } from '../theme/colors';
import { pinIcon } from './MapPinIcon';
import { DEFAULT_LAT, DEFAULT_LNG } from '../services/purokLocationService';

// Mirrors lib/screens/stores/widgets/store_location_picker_screen.dart — a
// bare-pin picker (no purok snapping, unlike the rider location picker):
// the admin just taps to place the store's exact pin.
export default function StoreLocationPickerDialog({ open, initialLatitude, initialLongitude, onCancel, onConfirm }) {
  const [pin, setPin] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

  useEffect(() => {
    if (!open) return;
    setPin(
      initialLatitude != null && initialLongitude != null
        ? { lat: initialLatitude, lng: initialLongitude }
        : { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
    );
  }, [open, initialLatitude, initialLongitude]);

  return (
    <Dialog open={open} onClose={onCancel} fullScreen>
      <AppBar sx={{ position: 'relative', bgcolor: AppColors.primary }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 1, fontSize: 18, fontWeight: 600 }}>Pin Store Location</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer center={[pin.lat, pin.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" maxZoom={19} />
          <Marker position={[pin.lat, pin.lng]} icon={pinIcon(AppColors.primary, 44)} />
          <MapClickHandler onClick={setPin} />
        </MapContainer>
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: AppColors.surface,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            zIndex: 1000,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 14, color: AppColors.info }} />
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>
            Tap anywhere on the map to place the store&apos;s pin
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: AppColors.surface, borderTop: `1px solid ${AppColors.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PlaceOutlinedIcon sx={{ fontSize: 16, color: AppColors.primary }} />
          <Typography sx={{ fontWeight: 600, fontSize: 12.5, fontFamily: 'monospace' }}>
            {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={() => onConfirm({ latitude: pin.lat, longitude: pin.lng })}
          sx={{ mt: 1.5, py: 1.5 }}
        >
          Confirm Location
        </Button>
      </Box>
    </Dialog>
  );
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}
