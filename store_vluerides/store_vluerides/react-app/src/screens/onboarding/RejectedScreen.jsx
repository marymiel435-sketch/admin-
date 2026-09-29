import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { auth } from '../../firebase';
import { AuthService } from '../../services/authService';
import { StorageService } from '../../services/storageService';
import { StoreService } from '../../services/storeService';
import { composeTrentoAddress } from '../../utils/address';
import { BillTypes, StoreCategories } from '../../utils/constants';
import { Validators } from '../../utils/validators';
import BrandHeader from '../../widgets/common/BrandHeader';
import FormSectionHeader from '../../widgets/common/FormSectionHeader';
import ResponsiveFieldRow from '../../widgets/common/ResponsiveFieldRow';
import ImageUploadField from '../../widgets/imageUpload/ImageUploadField';
import LocationPickerField from '../../widgets/locationPicker/LocationPickerField';

function MessageBanner({ text, color, background, icon: Icon }) {
  return (
    <Box p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: background }}>
      <Icon fontSize="small" sx={{ color, mr: 1.25 }} />
      <Typography variant="body2" sx={{ color, whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </Box>
  );
}

export default function RejectedScreen() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [category, setCategory] = useState(StoreCategories.list[0]);
  const [billType, setBillType] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null, barangay: null, purok: null });
  const [permitFile, setPermitFile] = useState(null);
  const [permitContentType, setPermitContentType] = useState(null);
  const [existingPermitUrl, setExistingPermitUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const isBiller = category === StoreCategories.bills;

  useEffect(() => {
    const uid = auth.currentUser.uid;
    StoreService.getStore(uid).then((s) => {
      if (s == null) return;
      setStore(s);
      setStoreName(s.storeName);
      setOwnerName(s.ownerName);
      setPhone(s.phone);
      setCategory(StoreCategories.list.includes(s.category) ? s.category : StoreCategories.list[0]);
      setBillType(s.billType ?? '');
      setLocation({ latitude: s.latitude, longitude: s.longitude, barangay: s.barangay, purok: s.purok });
      setExistingPermitUrl(s.permitPhotoUrl);
      setLoading(false);
    });
  }, []);

  const resubmit = async (e) => {
    e.preventDefault();
    const errors = {
      storeName: Validators.required(storeName, 'Store name'),
      billType: isBiller ? Validators.required(billType, 'Bill type') : null,
      ownerName: Validators.required(ownerName, 'Owner name'),
      phone: Validators.phone(phone),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (location.latitude == null || location.longitude == null || !location.purok) {
      setError('Please select your purok location below.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setWarning(null);
    try {
      const uid = auth.currentUser.uid;

      // Try the permit re-upload first, while still safely on this screen
      // — resubmitAfterRejection() below is what triggers the redirect to
      // /pending the instant it succeeds, so feedback about the photo
      // must happen before that call, not after (a warning set after the
      // resubmit write can lose the race against navigation).
      let permitPhotoUrl = existingPermitUrl;
      if (permitFile != null) {
        try {
          permitPhotoUrl = await StorageService.uploadPermitPhoto({ uid, bytes: permitFile, contentType: permitContentType });
        } catch (e) {
          console.debug('Permit photo upload failed:', e);
          setWarning(
            "Your new permit photo couldn't be uploaded, so your previous photo (if any) was kept. Your other changes will still be resubmitted.\n\nDetails: " +
              e
          );
        }
      }

      // The resubmission itself (flipping accountStatus back to Pending)
      // must never depend on the optional permit re-upload succeeding.
      await StoreService.resubmitAfterRejection({
        uid,
        updatedFields: {
          storeName: storeName.trim(),
          category,
          billType: isBiller ? billType : null,
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          address: composeTrentoAddress({ purok: location.purok, barangay: location.barangay, details: addressDetails }),
          barangay: location.barangay,
          purok: location.purok,
          latitude: location.latitude,
          longitude: location.longitude,
          permitPhotoUrl,
        },
      });
      // The router's redirect sends the owner to /pending once the doc
      // streams back with accountStatus: 'Pending'.
    } catch (e) {
      setError(`Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box minHeight="100vh">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6" fontWeight={700}>
            Application Rejected
          </Typography>
          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={() => AuthService.signOut()}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {loading ? (
        <Box display="flex" justifyContent="center" pt={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" px={2} py={4}>
          <Box maxWidth={680} width="100%">
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <BrandHeader />
              <Box height={20} />
              <CancelOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />
              <Box height={8} />
              <Typography variant="h5">Your application was not approved</Typography>
              {store?.rejectionReason && (
                <>
                  <Box height={12} />
                  <Box width="100%" p={1.5} borderRadius={1.5} sx={{ bgcolor: 'error.light' }} textAlign="left">
                    <Typography fontWeight="bold">Reason:</Typography>
                    <Typography>{store.rejectionReason}</Typography>
                  </Box>
                </>
              )}
            </Box>
            <Box height={24} />
            <Card>
              <Box p={3.5} component="form" onSubmit={resubmit} display="flex" flexDirection="column" gap={2}>
                <Typography variant="body2" textAlign="center">
                  Update your information and resubmit for review.
                </Typography>
                <FormSectionHeader icon={StorefrontOutlinedIcon} title="Store Details" />
                <TextField
                  fullWidth
                  label="Store / Business Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  error={Boolean(fieldErrors.storeName)}
                  helperText={fieldErrors.storeName ?? ' '}
                />
                <ResponsiveFieldRow>
                  <TextField select fullWidth label="Store Type" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {StoreCategories.list.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                  {isBiller ? (
                    <TextField
                      select
                      fullWidth
                      label="Bill Type"
                      value={billType}
                      onChange={(e) => setBillType(e.target.value)}
                      error={Boolean(fieldErrors.billType)}
                      helperText={fieldErrors.billType ?? ' '}
                    >
                      {BillTypes.list.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <Box />
                  )}
                </ResponsiveFieldRow>

                <Divider sx={{ my: 1 }} />
                <FormSectionHeader icon={PersonOutlineIcon} title="Owner & Contact" />
                <ResponsiveFieldRow>
                  <TextField
                    fullWidth
                    label="Owner Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    error={Boolean(fieldErrors.ownerName)}
                    helperText={fieldErrors.ownerName ?? ' '}
                  />
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={Boolean(fieldErrors.phone)}
                    helperText={fieldErrors.phone ?? ' '}
                  />
                </ResponsiveFieldRow>

                <Divider sx={{ my: 1 }} />
                <FormSectionHeader icon={PlaceOutlinedIcon} title="Business Location" />
                <LocationPickerField
                  initialLatitude={location.latitude}
                  initialLongitude={location.longitude}
                  initialBarangay={location.barangay}
                  initialPurok={location.purok}
                  onLocationSelected={(lat, lng, barangay, purok) => setLocation({ latitude: lat, longitude: lng, barangay, purok })}
                />
                <TextField
                  fullWidth
                  label="Landmark / Additional Address Details (optional)"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                />

                <Divider sx={{ my: 1 }} />
                <FormSectionHeader icon={BadgeOutlinedIcon} title="Verification (optional)" />
                <ImageUploadField
                  label="Business Permit / Valid ID"
                  initialImageUrl={existingPermitUrl}
                  onImageSelected={(file, contentType) => {
                    setPermitFile(file);
                    setPermitContentType(contentType);
                  }}
                />

                {error && <MessageBanner text={error} color="error.main" background="error.light" icon={ErrorOutlineIcon} />}
                {warning && (
                  <MessageBanner text={warning} color="#7a4a00" background="#fff3e0" icon={WarningAmberOutlinedIcon} />
                )}

                <Button type="submit" fullWidth variant="contained" disabled={submitting} sx={{ mt: 1 }}>
                  {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Resubmit for Review'}
                </Button>
              </Box>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}
