import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Avatar, Autocomplete, TextField, Snackbar, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import PinDropOutlinedIcon from '@mui/icons-material/PinDropOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import { CATEGORIES, BILL_TYPES } from '../../models/storeModel';
import { storeNameValidator } from '../../utils/validators';
import StoreLocationPickerDialog from '../../components/StoreLocationPickerDialog';
import { puroksInBarangay } from '../../services/purokLocationService';
import * as firestoreService from '../../services/firestoreService';

const BARANGAYS = [
  'Basa', 'Cebolin', 'Cuevas', 'Kapatungan', 'Langkila-an', 'Manat', 'New Visayas',
  'Pangyan', 'Poblacion', 'Pulang-lupa', 'Salvacion', 'San Ignacio', 'San Isidro',
  'San Roque', 'Santa Maria', 'Tudela',
];
const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Purok 7'];

const CATEGORY_META = {
  'Food Store': { icon: RestaurantOutlinedIcon, activeIcon: RestaurantIcon, subtitle: 'Restaurants & food orders' },
  'Pabili Store': { icon: ShoppingBagOutlinedIcon, activeIcon: ShoppingBagIcon, subtitle: 'Buy items from stores' },
  Bills: { icon: ReceiptLongOutlinedIcon, activeIcon: ReceiptLongIcon, subtitle: 'Electricity, water & more' },
};

// Matches the typed/selected address against the known purok/barangay
// dataset so the map can open already centered on that area.
function geocodeAddress(address) {
  if (!address?.trim()) return null;
  let matchedBarangay = null;
  for (const b of BARANGAYS) {
    if (address.includes(`Brgy. ${b}`)) {
      matchedBarangay = b;
      break;
    }
  }
  if (!matchedBarangay) return null;
  const puroksHere = puroksInBarangay(matchedBarangay);
  if (puroksHere.length === 0) return null;
  for (const p of PUROKS) {
    if (address.includes(`${p},`)) {
      const match = puroksHere.find((loc) => loc.purok === p);
      if (match) return match;
    }
  }
  return puroksHere[0];
}

// Mirrors lib/screens/stores/create_store_screen.dart
export default function CreateStoreScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useStores();
  const isEdit = Boolean(id);
  const store = isEdit ? provider.allStores.find((s) => s.id === id) : null;
  const fileInputRef = useRef(null);

  const [name, setName] = useState(store?.name ?? '');
  const [ownerName, setOwnerName] = useState(store?.ownerName ?? '');
  const [address, setAddress] = useState(store?.address ?? '');
  const [phone, setPhone] = useState(store?.phoneNumber ?? '');
  const [email, setEmail] = useState(store?.email ?? '');
  const [description, setDescription] = useState(store?.description ?? '');
  const [category, setCategory] = useState(CATEGORIES.includes(store?.category) ? store.category : CATEGORIES[0]);
  const [billType, setBillType] = useState(store?.billType ?? (category === 'Bills' ? BILL_TYPES[0] : null));
  const [pabiliType, setPabiliType] = useState(store?.pabiliType ?? null);
  const [pabiliCategories, setPabiliCategories] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [latitude, setLatitude] = useState(store?.latitude ?? null);
  const [longitude, setLongitude] = useState(store?.longitude ?? null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    const unsubscribe = firestoreService.streamPabiliCategories(setPabiliCategories, () => {});
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (pabiliCategories && (!pabiliType || !pabiliCategories.includes(pabiliType))) {
      setPabiliType(pabiliCategories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pabiliCategories]);

  if (isEdit && !store) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: AppColors.textSecondary }}>Store not found.</Typography>
      </Box>
    );
  }

  const suggestions = useMemo(() => {
    const list = BARANGAYS.map((b) => `Brgy. ${b}, Trento, Agusan del Sur`);
    for (const p of PUROKS) {
      for (const b of BARANGAYS) list.push(`${p}, Brgy. ${b}, Trento, Agusan del Sur`);
    }
    return list;
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    if (cat === 'Bills') setBillType((prev) => prev ?? BILL_TYPES[0]);
    else setBillType(null);
    if (cat !== 'Pabili Store') setPabiliType(null);
  };

  const handleAddressSelected = (value) => {
    setAddress(value);
    const geocoded = geocodeAddress(value);
    if (geocoded) {
      setLatitude(geocoded.latitude);
      setLongitude(geocoded.longitude);
    }
  };

  const handlePickLocation = () => {
    if (latitude == null || longitude == null) {
      const geocoded = geocodeAddress(address);
      if (geocoded) {
        setLatitude(geocoded.latitude);
        setLongitude(geocoded.longitude);
      }
    }
    setLocationPickerOpen(true);
  };

  const handleLogoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {
      name: storeNameValidator(name),
      address: address.trim() ? null : 'This field is required',
      billType: category === 'Bills' && !billType ? 'Select a bill type' : null,
      pabiliType: category === 'Pabili Store' && !pabiliType ? 'Select a pabili type' : null,
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      ownerName: ownerName.trim(),
      category,
      billType: category === 'Bills' ? billType : null,
      pabiliType: category === 'Pabili Store' ? pabiliType : null,
      address: address.trim(),
      latitude,
      longitude,
      phoneNumber: phone.trim(),
      email: email.trim() || null,
      description: description.trim() || null,
      // Admin-created stores skip the approval queue — only self-registered
      // stores from the store-owner app start out 'Pending'.
      accountStatus: isEdit ? store.accountStatus : 'Approved',
    };

    const ok = isEdit
      ? await provider.updateStore({ id: store.id, data, newLogo: logoFile })
      : await provider.createStore({ data, logo: logoFile });

    if (ok) {
      navigate(-1);
    } else {
      setSnackbar({ severity: 'error', message: provider.error || 'Something went wrong' });
    }
  };

  const existingLogo = store?.logoUrl;

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>{isEdit ? 'Edit Store' : 'Add Store'}</Typography>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 720, mx: 'auto' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                bgcolor: `${AppColors.primary}14`,
                border: `2px solid ${AppColors.primary}4D`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {logoPreview || existingLogo ? (
                <Avatar src={logoPreview || existingLogo} variant="rounded" sx={{ width: '100%', height: '100%' }} />
              ) : (
                <>
                  <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, color: AppColors.primary }} />
                  <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, mt: 0.5 }}>Logo</Typography>
                </>
              )}
            </Box>
          </Box>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoPick} />
          <Button size="small" startIcon={<PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => fileInputRef.current?.click()}>
            {logoFile || existingLogo ? 'Change Logo' : 'Upload Logo'}
          </Button>
        </Box>

        {/* Store Information */}
        <FormSection title="Store Information" icon={StoreOutlinedIcon}>
          <TextField fullWidth label="Store Name" value={name} onChange={(e) => setName(e.target.value)} error={Boolean(errors.name)} helperText={errors.name} InputProps={{ startAdornment: <StoreOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />
          <TextField fullWidth label="Owner Name (optional)" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} InputProps={{ startAdornment: <PersonOutlineIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />

          <Box>
            <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mb: 1.25 }}>Store Type *</Typography>
            <Box sx={{ display: 'flex', gap: 1.25 }}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const meta = CATEGORY_META[cat];
                const Icon = isSelected ? meta.activeIcon : meta.icon;
                return (
                  <Box
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    sx={{
                      flex: 1,
                      py: 2.25,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      bgcolor: isSelected ? `${AppColors.primary}14` : 'transparent',
                      border: `${isSelected ? 2 : 1}px solid ${isSelected ? AppColors.primary : AppColors.border}`,
                    }}
                  >
                    <Icon sx={{ fontSize: 30, color: isSelected ? AppColors.primary : AppColors.textSecondary }} />
                    <Typography sx={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? AppColors.primary : AppColors.textPrimary, mt: 1 }}>{cat}</Typography>
                    <Typography sx={{ fontSize: 10.5, color: isSelected ? `${AppColors.primary}B3` : AppColors.textSecondary, mt: 0.5, px: 0.5 }}>{meta.subtitle}</Typography>
                    {isSelected && <CheckCircleIcon sx={{ fontSize: 14, color: AppColors.primary, mt: 0.75 }} />}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {category === 'Bills' && (
            <TextField
              select
              fullWidth
              label="Bill Type *"
              value={billType ?? BILL_TYPES[0]}
              onChange={(e) => setBillType(e.target.value)}
              error={Boolean(errors.billType)}
              helperText={errors.billType}
              SelectProps={{ native: true }}
              InputProps={{ startAdornment: <ElectricBoltOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
            >
              {BILL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TextField>
          )}

          {category === 'Pabili Store' && (
            pabiliCategories === null ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={18} />
              </Box>
            ) : (
              <TextField
                select
                fullWidth
                label="Pabili Type *"
                value={pabiliCategories.includes(pabiliType) ? pabiliType : pabiliCategories[0]}
                onChange={(e) => setPabiliType(e.target.value)}
                error={Boolean(errors.pabiliType)}
                helperText={errors.pabiliType}
                SelectProps={{ native: true }}
                InputProps={{ startAdornment: <ShoppingBagOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
              >
                {pabiliCategories.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </TextField>
            )
          )}

          <Autocomplete
            freeSolo
            options={suggestions}
            inputValue={address}
            onInputChange={(_, value) => setAddress(value)}
            onChange={(_, value) => value && handleAddressSelected(value)}
            filterOptions={(options, state) => {
              const q = state.inputValue.trim().toLowerCase();
              if (!q) return options.slice(0, 8);
              return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Address"
                placeholder="Type purok, barangay, or street..."
                error={Boolean(errors.address)}
                helperText={errors.address}
                InputProps={{ ...params.InputProps, startAdornment: <PinDropOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
              />
            )}
          />

          <Box
            onClick={handlePickLocation}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: '12px', bgcolor: AppColors.background, border: `1px solid ${AppColors.border}`, cursor: 'pointer' }}
          >
            <PinDropOutlinedIcon sx={{ color: latitude != null ? AppColors.primary : AppColors.textSecondary }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: latitude != null ? AppColors.textPrimary : AppColors.textSecondary }}>
                {latitude != null ? 'Store location pinned' : 'No exact location pinned'}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>
                {latitude != null ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Tap to pin the exact location on the map'}
              </Typography>
            </Box>
            <Typography sx={{ color: AppColors.primary, fontWeight: 600, fontSize: 12.5 }}>{latitude != null ? 'Change' : 'Pin Location'}</Typography>
          </Box>

          <TextField fullWidth multiline rows={3} label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} InputProps={{ startAdornment: <DescriptionOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1, alignSelf: 'flex-start', mt: 1 }} /> }} />
        </FormSection>

        {/* Contact Details */}
        <FormSection title="Contact Details" icon={ContactPhoneOutlinedIcon}>
          <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />
          <TextField fullWidth type="email" label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />
        </FormSection>

        <Button
          fullWidth
          variant="contained"
          startIcon={provider.isSaving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon />}
          disabled={provider.isSaving}
          onClick={handleSubmit}
          sx={{ py: 1.75, fontWeight: 700 }}
        >
          {provider.isSaving ? 'Saving...' : isEdit ? 'SAVE CHANGES' : 'ADD STORE'}
        </Button>
      </Box>

      <StoreLocationPickerDialog
        open={locationPickerOpen}
        initialLatitude={latitude}
        initialLongitude={longitude}
        onCancel={() => setLocationPickerOpen(false)}
        onConfirm={(result) => {
          setLatitude(result.latitude);
          setLongitude(result.longitude);
          setLocationPickerOpen(false);
        }}
      />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <Box sx={{ p: 2.25, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon sx={{ color: AppColors.primary, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{title}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>{children}</Box>
    </Box>
  );
}
