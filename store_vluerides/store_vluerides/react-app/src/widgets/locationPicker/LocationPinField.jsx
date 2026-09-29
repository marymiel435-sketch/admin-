import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { forwardRef, useRef, useState } from 'react';

import LocationPickerField from './LocationPickerField';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Registration-form variant of LocationPickerField: rather than embedding
// the map inline in a long signup form, this shows a single "Pin Your
// Business Location" button that opens the picker (purok search + map) in
// a full-screen dialog. The chosen pin is then shown as a short summary
// line under the button.
export default function LocationPinField({
  initialLatitude,
  initialLongitude,
  initialBarangay,
  initialPurok,
  onLocationSelected,
}) {
  const [latitude, setLatitude] = useState(initialLatitude ?? null);
  const [longitude, setLongitude] = useState(initialLongitude ?? null);
  const [barangay, setBarangay] = useState(initialBarangay ?? null);
  const [purok, setPurok] = useState(initialPurok ?? null);
  const [open, setOpen] = useState(false);
  // Tracks the latest pin from the embedded picker; only committed to the
  // caller once "Confirm Location" is pressed, not on every map tap.
  const pickedRef = useRef(null);

  const hasPin = latitude != null && longitude != null;

  const confirm = () => {
    const result =
      pickedRef.current ?? (latitude != null && longitude != null ? { latitude, longitude, barangay: barangay ?? '', purok: purok ?? '' } : null);
    setOpen(false);
    pickedRef.current = null;
    if (result == null) return;
    setLatitude(result.latitude);
    setLongitude(result.longitude);
    setBarangay(result.barangay);
    setPurok(result.purok);
    onLocationSelected(result.latitude, result.longitude, result.barangay, result.purok);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
        Business Location — Trento, Agusan del Sur
      </Typography>
      <Button
        variant="outlined"
        startIcon={hasPin ? <EditLocationAltOutlinedIcon /> : <AddLocationAltOutlinedIcon />}
        onClick={() => setOpen(true)}
      >
        {hasPin ? 'Change Pinned Location' : 'Pin Your Business Location'}
      </Button>
      <Box height={8} />
      <Typography variant="caption" color={hasPin ? 'text.secondary' : 'error'}>
        {hasPin
          ? purok
            ? `Pin: ${purok}, Brgy. ${barangay} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
            : `Pin: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          : 'No location pinned yet.'}
      </Typography>

      <Dialog fullScreen open={open} onClose={() => setOpen(false)} TransitionComponent={Transition}>
        <AppBar position="relative" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant="subtitle1" fontWeight={800}>
              Pin Your Business Location
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box flex={1} overflow="auto" px={2}>
          <LocationPickerField
            initialLatitude={latitude}
            initialLongitude={longitude}
            initialBarangay={barangay}
            initialPurok={purok}
            onLocationSelected={(lat, lng, b, p) => {
              pickedRef.current = { latitude: lat, longitude: lng, barangay: b, purok: p };
            }}
          />
        </Box>
        <Box p={2}>
          <Button fullWidth variant="contained" onClick={confirm}>
            Confirm Location
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
