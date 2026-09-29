import SearchIcon from '@mui/icons-material/Search';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

import { TrentoLocations } from '../../data/trentoLocations';
import { Purok } from '../../models/purok';
import OsmMapWidget from './OsmMapWidget';

const filterOptions = createFilterOptions({ limit: 30, stringify: (p) => p.label });

// Location picker scoped to Trento, Agusan del Sur: the owner types a
// purok/barangay name into a search field and picks from a dropdown of
// matches sourced from the municipality's own purok records, then can tap
// the map to fine-tune the exact pin for their business.
export default function LocationPickerField({
  initialLatitude,
  initialLongitude,
  initialBarangay,
  initialPurok,
  onLocationSelected,
}) {
  const mapRef = useRef(null);
  const [puroks, setPuroks] = useState([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(
    initialLatitude != null && initialLongitude != null
      ? { lat: initialLatitude, lng: initialLongitude }
      : TrentoLocations.center
  );
  const [selectedPurok, setSelectedPurok] = useState(
    initialBarangay && initialPurok
      ? new Purok({
          barangay: initialBarangay,
          purok: initialPurok,
          latitude: initialLatitude,
          longitude: initialLongitude,
        })
      : null
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    TrentoLocations.load().then((list) => {
      if (!cancelled) {
        setPuroks(list);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectPurok = (purok) => {
    const point = { lat: purok.latitude, lng: purok.longitude };
    setSelectedPurok(purok);
    setSelected(point);
    setTouched(true);
    onLocationSelected(point.lat, point.lng, purok.barangay, purok.purok);
    mapRef.current?.setView([point.lat, point.lng], 16);
  };

  const refinePin = (latlng) => {
    const clamped = {
      lat: TrentoLocations.clampLatitude(latlng.lat),
      lng: TrentoLocations.clampLongitude(latlng.lng),
    };
    setSelected(clamped);
    onLocationSelected(clamped.lat, clamped.lng, selectedPurok?.barangay ?? '', selectedPurok?.purok ?? '');
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch">
      <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
        Business Location — Trento, Agusan del Sur
      </Typography>
      <Autocomplete
        options={puroks}
        loading={!ready}
        value={selectedPurok}
        filterOptions={filterOptions}
        getOptionLabel={(p) => p.label}
        isOptionEqualToValue={(a, b) => a.barangay === b.barangay && a.purok === b.purok}
        onChange={(_e, value) => {
          setTouched(true);
          if (value) selectPurok(value);
        }}
        renderOption={(props, option) => (
          <li {...props} key={`${option.barangay}-${option.purok}`}>
            <Box>
              <Typography variant="body2">{option.purok}</Typography>
              <Typography variant="caption" color="text.secondary">
                Brgy. {option.barangay}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Purok / Barangay"
            placeholder={ready ? 'e.g. "Purok-3" or "Poblacion"' : 'Loading Trento locations…'}
            error={touched && selectedPurok == null}
            helperText={touched && selectedPurok == null ? 'Select a purok from the dropdown below' : ' '}
            InputProps={{ ...params.InputProps, startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} /> }}
          />
        )}
      />
      <Typography variant="caption" color="text.secondary" mt={1}>
        Select a purok above, then tap the map to fine-tune the exact pin for your business.
      </Typography>
      <Box height={8} />
      <Box height={300}>
        <OsmMapWidget center={selected} onTap={refinePin} mapRef={mapRef} />
      </Box>
      <Box height={4} />
      <Typography variant="caption" color="text.secondary">
        {selectedPurok
          ? `Pin: ${selectedPurok.label} (${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)})`
          : `Pin: ${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`}
      </Typography>
    </Box>
  );
}
