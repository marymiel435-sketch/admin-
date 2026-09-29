import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { AppColors } from '../theme/colors';
import { pinIcon } from './MapPinIcon';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  getBarangays,
  puroksInBarangay,
  findNearest,
  readableAddress,
} from '../services/purokLocationService';

// Mirrors lib/screens/riders/widgets/location_picker_screen.dart, presented
// as a full-screen dialog rather than a pushed route (equivalent UX for a
// "pick and return" flow on the web).
export default function LocationPickerDialog({ open, initial, onCancel, onConfirm }) {
  const [pin, setPin] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [barangay, setBarangay] = useState(null);
  const [purok, setPurok] = useState(null);
  // Only bumped on dropdown selection, not on direct map taps — matches the
  // Dart version, which calls `_mapController.move()` on dropdown change but
  // leaves the camera alone (just moves the marker) when the user taps.
  const [recenterTarget, setRecenterTarget] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (initial?.latitude != null && initial?.longitude != null) {
      setPin({ lat: initial.latitude, lng: initial.longitude });
      setBarangay(initial.barangay ?? null);
      setPurok(initial.purok ?? null);
      if (!initial.barangay || !initial.purok) {
        const nearest = findNearest(initial.latitude, initial.longitude);
        if (nearest) {
          setBarangay(nearest.barangay);
          setPurok(nearest.purok);
        }
      }
    } else {
      setPin({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      const nearest = findNearest(DEFAULT_LAT, DEFAULT_LNG);
      if (nearest) {
        setBarangay(nearest.barangay);
        setPurok(nearest.purok);
      }
    }
  }, [open, initial]);

  const barangays = useMemo(() => getBarangays(), []);
  const puroksForBarangay = barangay ? puroksInBarangay(barangay) : [];
  const nearest = findNearest(pin.lat, pin.lng);

  const handleBarangayChange = (value) => {
    const puroks = puroksInBarangay(value);
    if (puroks.length === 0) return;
    const first = puroks[0];
    setBarangay(value);
    setPurok(first.purok);
    const target = { lat: first.latitude, lng: first.longitude };
    setPin(target);
    setRecenterTarget(target);
  };

  const handlePurokChange = (value) => {
    const match = puroksForBarangay.find((p) => p.purok === value);
    if (!match) return;
    setPurok(value);
    const target = { lat: match.latitude, lng: match.longitude };
    setPin(target);
    setRecenterTarget(target);
  };

  const handleMapClick = (latlng) => {
    const nearestPurok = findNearest(latlng.lat, latlng.lng);
    setPin(latlng);
    if (nearestPurok) {
      setBarangay(nearestPurok.barangay);
      setPurok(nearestPurok.purok);
    }
  };

  const canConfirm = barangay != null && purok != null;

  return (
    <Dialog open={open} onClose={onCancel} fullScreen>
      <AppBar sx={{ position: 'relative', bgcolor: AppColors.primary }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 1, fontSize: 18, fontWeight: 600 }}>Set Rider Location</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, bgcolor: AppColors.surface, display: 'flex', gap: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Barangay</InputLabel>
          <Select label="Barangay" value={barangay ?? ''} onChange={(e) => handleBarangayChange(e.target.value)}>
            {barangays.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Purok</InputLabel>
          <Select label="Purok" value={purok ?? ''} onChange={(e) => handlePurokChange(e.target.value)} disabled={puroksForBarangay.length === 0}>
            {puroksForBarangay.map((p) => (
              <MenuItem key={p.purok} value={p.purok}>
                {p.purok}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapContainer center={[pin.lat, pin.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />
          <Marker position={[pin.lat, pin.lng]} icon={pinIcon(AppColors.primary, 44)} />
          <MapClickHandler onClick={handleMapClick} />
          {recenterTarget && <MapRecenter center={recenterTarget} />}
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
            Tap anywhere on the map to fine-tune the exact pin
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: AppColors.surface, borderTop: `1px solid ${AppColors.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PlaceOutlinedIcon sx={{ fontSize: 16, color: AppColors.primary }} />
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
            {nearest ? readableAddress(nearest) : 'Trento, Agusan del Sur'}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, fontFamily: 'monospace', mt: 0.5 }}>
          {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CheckIcon />}
          disabled={!canConfirm}
          onClick={() => onConfirm({ latitude: pin.lat, longitude: pin.lng, purok, barangay })}
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

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);
  return null;
}
