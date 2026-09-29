import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Avatar, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MotorcycleIcon from '@mui/icons-material/TwoWheeler';
import LockIcon from '@mui/icons-material/Lock';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import { FormSection, FormRow, FormField, FormDropdown, FormDateField } from '../../components/FormPieces';
import LocationField from '../../components/LocationField';
import LocationPickerDialog from '../../components/LocationPickerDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import {
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
  philippinePhoneValidator,
  licenseNumberValidator,
  plateNumberValidator,
  required,
} from '../../utils/validators';

const GENDERS = ['Male', 'Female', 'Other'];
const VEHICLE_TYPES = ['Motorcycle', 'Bicycle', 'Tricycle'];
const DOB_DEFAULT = new Date(Date.now() - 6570 * 24 * 60 * 60 * 1000); // ~18 years ago
const LICENSE_EXPIRY_DEFAULT = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

// Mirrors lib/screens/riders/create_rider_screen.dart
export default function CreateRiderScreen() {
  const provider = useRiders();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fields, setFields] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    dob: null, gender: 'Male', phone: '', email: '', username: '', address: '',
    licenseNumber: '', licenseExpiry: null, motorcycleBrand: '', motorcycleModel: '',
    plate: '', vehicleColor: '', vehicleType: 'Motorcycle',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState({ latitude: null, longitude: null, purok: null, barangay: null });
  const [locationError, setLocationError] = useState(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const set = (key) => (value) => setFields((f) => ({ ...f, [key]: value }));

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {
      firstName: required(fields.firstName, 'First Name'),
      lastName: required(fields.lastName, 'Last Name'),
      dob: fields.dob ? null : 'Date of birth required',
      phone: philippinePhoneValidator(fields.phone),
      email: emailValidator(fields.email),
      username: required(fields.username, 'Username'),
      address: required(fields.address, 'Address'),
      motorcycleBrand: required(fields.motorcycleBrand, 'Motorcycle Brand'),
      motorcycleModel: required(fields.motorcycleModel, 'Model'),
      plate: plateNumberValidator(fields.plate),
      vehicleColor: required(fields.vehicleColor, 'Color'),
      licenseNumber: licenseNumberValidator(fields.licenseNumber),
      licenseExpiry: fields.licenseExpiry ? null : 'License expiry required',
      password: passwordValidator(fields.password),
      confirmPassword: confirmPasswordValidator(fields.confirmPassword, fields.password),
    };
    setErrors(e);
    const isLocationSet = location.latitude != null && location.longitude != null && location.purok != null;
    setLocationError(isLocationSet ? null : 'Rider location is required');
    return Object.values(e).every((v) => !v) && isLocationSet;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setSnackbar({ severity: 'error', message: 'Please fix all errors' });
      return;
    }

    const email = fields.email.trim();
    const phone = fields.phone.trim();

    if (await provider.isEmailUsed(email)) {
      setSnackbar({ severity: 'error', message: 'Email already registered' });
      return;
    }
    if (await provider.isPhoneUsed(phone)) {
      setSnackbar({ severity: 'error', message: 'Phone number already registered' });
      return;
    }

    const firstName = fields.firstName.trim();
    const lastName = fields.lastName.trim();
    const middleName = fields.middleName.trim();
    const suffix = fields.suffix.trim();

    const riderData = {
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      fullName: [firstName, middleName, lastName, suffix].filter(Boolean).join(' '),
      dateOfBirth: fields.dob ?? DOB_DEFAULT,
      gender: fields.gender,
      phoneNumber: phone,
      email,
      username: fields.username.trim(),
      homeAddress: fields.address.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      purok: location.purok,
      barangay: location.barangay,
      licenseNumber: fields.licenseNumber.trim(),
      licenseExpiry: fields.licenseExpiry ?? LICENSE_EXPIRY_DEFAULT,
      vehicleType: fields.vehicleType,
      motorcycleBrand: fields.motorcycleBrand.trim(),
      motorcycleModel: fields.motorcycleModel.trim(),
      plateNumber: fields.plate.trim().toUpperCase(),
      vehicleColor: fields.vehicleColor.trim(),
    };

    const success = await provider.createRider({
      riderData,
      email,
      password: fields.password,
      profilePhoto,
    });

    if (success) {
      navigate(-1);
    } else {
      setSnackbar({ severity: 'error', message: provider.error || 'Failed to create rider account' });
    }
  };

  return (
    <LoadingOverlay isLoading={provider.isCreating} message="Creating rider account...">
      <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
        <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', background: 'linear-gradient(90deg, #1E50DA 0%, #2563EB 55%, #1E8FCF 100%)', color: '#fff' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1, flex: 1 }}>Create Rider Account</Typography>
          <Button
            onClick={handleSubmit}
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.16)' }}
          >
            Save
          </Button>
        </Box>

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 720, mx: 'auto' }}>
          {/* Photo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              <Avatar src={profilePhotoPreview} sx={{ width: 110, height: 110, bgcolor: AppColors.surface, border: `3px solid ${AppColors.primary}` }}>
                {!profilePhotoPreview && <PersonAddAltIcon sx={{ fontSize: 40, color: AppColors.primary }} />}
              </Avatar>
              <Box sx={{ position: 'absolute', right: 2, bottom: 2, p: 0.75, borderRadius: '50%', bgcolor: AppColors.primary, border: `2px solid ${AppColors.surface}`, display: 'flex' }}>
                <CameraAltIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
            </Box>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoPick} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: AppColors.primary }}>
              {profilePhoto ? 'Change Profile Photo' : 'Add Profile Photo'}
            </Typography>
          </Box>

          <FormSection title="Personal Information" icon={PersonOutlinedIcon} accent={AppColors.primary}>
            <FormRow>
              <FormField label="First Name" value={fields.firstName} onChange={set('firstName')} error={errors.firstName} />
              <FormField label="Last Name" value={fields.lastName} onChange={set('lastName')} error={errors.lastName} />
            </FormRow>
            <FormRow>
              <FormField label="Middle Name" value={fields.middleName} onChange={set('middleName')} />
              <FormField label="Suffix" value={fields.suffix} onChange={set('suffix')} />
            </FormRow>
            <FormDateField label="Date of Birth" value={fields.dob} onChange={set('dob')} error={errors.dob} max={DOB_DEFAULT} icon={CalendarTodayOutlinedIcon} />
            <FormDropdown label="Gender" value={fields.gender} onChange={set('gender')} options={GENDERS} />
            <FormField label="Phone Number" value={fields.phone} onChange={set('phone')} error={errors.phone} icon={PhoneOutlinedIcon} />
            <FormField label="Email Address" value={fields.email} onChange={set('email')} error={errors.email} icon={EmailOutlinedIcon} type="email" />
            <FormField label="Username" value={fields.username} onChange={set('username')} error={errors.username} icon={AlternateEmailIcon} />
            <FormField label="Home Address" value={fields.address} onChange={set('address')} error={errors.address} icon={HomeOutlinedIcon} multiline rows={2} />
            <LocationField
              purok={location.purok}
              barangay={location.barangay}
              latitude={location.latitude}
              longitude={location.longitude}
              errorText={locationError}
              onTap={() => setLocationPickerOpen(true)}
            />
          </FormSection>

          <FormSection title="Vehicle & License" icon={MotorcycleIcon} accent="#4F46E5">
            <FormDropdown label="Vehicle Type" value={fields.vehicleType} onChange={set('vehicleType')} options={VEHICLE_TYPES} />
            <FormRow>
              <FormField label="Motorcycle Brand" value={fields.motorcycleBrand} onChange={set('motorcycleBrand')} error={errors.motorcycleBrand} />
              <FormField label="Motorcycle Model" value={fields.motorcycleModel} onChange={set('motorcycleModel')} error={errors.motorcycleModel} />
            </FormRow>
            <FormRow>
              <FormField label="Plate Number" value={fields.plate} onChange={set('plate')} error={errors.plate} icon={ConfirmationNumberOutlinedIcon} />
              <FormField label="Vehicle Color" value={fields.vehicleColor} onChange={set('vehicleColor')} error={errors.vehicleColor} icon={ColorLensOutlinedIcon} />
            </FormRow>
            <FormField label="Driver's License No." value={fields.licenseNumber} onChange={set('licenseNumber')} error={errors.licenseNumber} icon={CardMembershipOutlinedIcon} />
            <FormDateField label="License Expiry Date" value={fields.licenseExpiry} onChange={set('licenseExpiry')} error={errors.licenseExpiry} min={new Date()} icon={EventOutlinedIcon} />
          </FormSection>

          <FormSection title="Account Credentials" icon={LockOutlinedIcon} accent="#F59E0B">
            <FormField label="Password" value={fields.password} onChange={set('password')} error={errors.password} icon={LockIcon} type="password" />
            <FormField label="Confirm Password" value={fields.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} icon={LockIcon} type="password" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1, bgcolor: AppColors.infoLight }}>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: AppColors.info }} />
              <Typography sx={{ fontSize: 11, color: AppColors.info }}>Rider will be created with Approved status immediately.</Typography>
            </Box>
          </FormSection>

          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={handleSubmit}
            sx={{ py: 1.75, fontWeight: 700, letterSpacing: 0.3, background: 'linear-gradient(90deg, #1E50DA, #2563EB, #1E8FCF)' }}
          >
            CREATE RIDER ACCOUNT
          </Button>
        </Box>
      </Box>

      <LocationPickerDialog
        open={locationPickerOpen}
        initial={location}
        onCancel={() => setLocationPickerOpen(false)}
        onConfirm={(result) => {
          setLocation(result);
          setLocationError(null);
          setLocationPickerOpen(false);
        }}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </LoadingOverlay>
  );
}
