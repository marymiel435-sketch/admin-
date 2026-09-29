import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { auth } from '../../../firebase';
import { StorageService } from '../../../services/storageService';
import { StoreService } from '../../../services/storeService';
import { composeTrentoAddress } from '../../../utils/address';
import { Validators } from '../../../utils/validators';
import FormSectionHeader from '../../../widgets/common/FormSectionHeader';
import ImageUploadField from '../../../widgets/imageUpload/ImageUploadField';
import LocationPickerField from '../../../widgets/locationPicker/LocationPickerField';

function MessageBanner({ text, color, background, icon: Icon }) {
  return (
    <Box p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: background }}>
      <Icon fontSize="small" sx={{ color, mr: 1.25 }} />
      <Typography variant="body2" sx={{ color }}>
        {text}
      </Typography>
    </Box>
  );
}

export default function StoreProfileScreen() {
  const uid = auth.currentUser.uid;

  const [storeName, setStoreName] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [hours, setHours] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null, barangay: null, purok: null });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoContentType, setPhotoContentType] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    StoreService.getStore(uid).then((store) => {
      if (store == null) return;
      setStoreName(store.storeName);
      setHours(store.hours ?? '');
      setLocation({ latitude: store.latitude, longitude: store.longitude, barangay: store.barangay, purok: store.purok });
      setExistingPhotoUrl(store.photoUrl);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const nameErr = Validators.required(storeName, 'Store name');
    setNameError(nameErr);
    if (nameErr) return;
    if (location.latitude == null || location.longitude == null || !location.purok) {
      setLocationError('Please select your purok location above.');
      return;
    }
    setLocationError(null);
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      let photoUrl = existingPhotoUrl;
      if (photoFile != null) {
        photoUrl = await StorageService.uploadStorePhoto({ uid, bytes: photoFile, contentType: photoContentType });
      }

      await StoreService.updateStoreProfile({
        uid,
        storeName: storeName.trim(),
        address: composeTrentoAddress({ purok: location.purok, barangay: location.barangay, details: addressDetails }),
        barangay: location.barangay,
        purok: location.purok,
        hours: hours.trim() === '' ? null : hours.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        photoUrl,
      });
      setExistingPhotoUrl(photoUrl);
      setSuccessMessage('Profile updated');
    } catch (e) {
      setError(`Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" pt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" px={3} pt={3.5} pb={3}>
      <Box maxWidth={720} width="100%">
        <Typography variant="h5" fontWeight={800}>Store Profile</Typography>
        <Box height={4} />
        <Typography variant="body2" color="text.secondary">This is how your store appears to customers and riders.</Typography>
        <Box height={20} />
        <Box p={3} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" component="form" onSubmit={submit} display="flex" flexDirection="column" gap={2}>
          <FormSectionHeader icon={StorefrontOutlinedIcon} title="Store Details" />
          <ImageUploadField
            label="Store Photo"
            initialImageUrl={existingPhotoUrl}
            onImageSelected={(file, contentType) => {
              setPhotoFile(file);
              setPhotoContentType(contentType);
            }}
          />
          <TextField fullWidth label="Store / Business Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} error={Boolean(nameError)} helperText={nameError ?? ' '} />

          <Divider sx={{ my: 1 }} />
          <FormSectionHeader icon={PlaceOutlinedIcon} title="Business Location" />
          <LocationPickerField
            initialLatitude={location.latitude}
            initialLongitude={location.longitude}
            initialBarangay={location.barangay}
            initialPurok={location.purok}
            onLocationSelected={(lat, lng, barangay, purok) => setLocation({ latitude: lat, longitude: lng, barangay, purok })}
          />
          <TextField fullWidth label="Landmark / Additional Address Details (optional)" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} />
          <TextField fullWidth label="Hours (optional)" placeholder="e.g. Mon-Sat 9AM-8PM" value={hours} onChange={(e) => setHours(e.target.value)} />

          {locationError && <MessageBanner text={locationError} color="error.main" background="error.light" icon={ErrorOutlineIcon} />}
          {error && <MessageBanner text={error} color="error.main" background="error.light" icon={ErrorOutlineIcon} />}
          {successMessage && <MessageBanner text={successMessage} color="#22A55A" background="#22A55A1F" icon={CheckCircleOutlineIcon} />}

          <Button type="submit" variant="contained" disabled={submitting} sx={{ mt: 1 }}>
            {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
