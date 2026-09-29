import { useRef, useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AppColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import * as firestoreService from '../../services/firestoreService';
import * as storageService from '../../services/storageService';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import LoadingOverlay from '../../components/LoadingOverlay';

// Mirrors lib/screens/profile/profile_screen.dart
export default function ProfileScreen() {
  const auth = useAuth();
  const admin = auth.admin;
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  if (!admin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
        <CircularProgress sx={{ color: AppColors.primary }} />
      </Box>
    );
  }

  const startEditing = () => {
    setName(admin.name ?? '');
    setPhone(admin.phone ?? '');
    setNewPhoto(null);
    setNewPhotoPreview(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setNewPhoto(null);
    setNewPhotoPreview(null);
    setEditing(false);
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhoto(file);
    setNewPhotoPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setSaving(true);
    try {
      let photoUrl = admin.photoUrl;
      if (newPhoto) {
        photoUrl = await storageService.uploadAdminPhoto(admin.id, newPhoto);
      }
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      await firestoreService.updateAdmin(admin.id, { name: trimmedName, phone: trimmedPhone, photoUrl });
      auth.setAdmin({ ...admin, name: trimmedName, phone: trimmedPhone, photoUrl });
      setEditing(false);
      setSnackbar({ severity: 'success', message: 'Profile updated' });
    } catch (e) {
      setSnackbar({ severity: 'error', message: `Failed to update profile: ${e?.message ?? e}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LoadingOverlay isLoading={saving}>
      <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
        <Box sx={{ height: 64, px: 2.5, display: 'flex', alignItems: 'center', bgcolor: AppColors.surface, borderBottom: `1px solid ${AppColors.divider}` }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, flex: 1 }}>My Profile</Typography>
          {!editing && (
            <Button startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />} onClick={startEditing}>
              Edit
            </Button>
          )}
        </Box>

        <Box sx={{ p: 2.5, maxWidth: 520, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Avatar card */}
          <Box sx={{ py: 3.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <CustomAvatar imageUrl={newPhotoPreview || admin.photoUrl} name={admin.name || 'Admin'} size={96} />
              {editing && (
                <>
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ position: 'absolute', right: 0, bottom: 0, p: 0.9, borderRadius: '50%', bgcolor: AppColors.primary, border: `2px solid ${AppColors.surface}`, cursor: 'pointer', display: 'flex' }}
                  >
                    <CameraAltOutlinedIcon sx={{ color: '#fff', fontSize: 16 }} />
                  </Box>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
                </>
              )}
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, mt: 1.75 }}>{admin.name || 'Administrator'}</Typography>
            <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mt: 0.5 }}>{admin.email}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.25, px: 1.5, py: 0.6, borderRadius: '20px', bgcolor: AppColors.infoLight }}>
              <ShieldOutlinedIcon sx={{ fontSize: 13, color: AppColors.info }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: AppColors.info }}>
                {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
              </Typography>
            </Box>
          </Box>

          {/* Details card */}
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonOutlineIcon sx={{ color: AppColors.primary, fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Account Details</Typography>
            </Box>
            {editing ? (
              <>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  error={Boolean(nameError)}
                  helperText={nameError}
                  InputProps={{ startAdornment: <PersonOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
                />
                <TextField
                  fullWidth
                  sx={{ mt: 1.5 }}
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
                />
                <Box sx={{ mt: 1.5 }}>
                  <ReadOnlyRow icon={EmailOutlinedIcon} label="Email" value={admin.email} />
                </Box>
              </>
            ) : (
              <>
                <ReadOnlyRow icon={PersonOutlinedIcon} label="Name" value={admin.name || '—'} />
                <ReadOnlyRow icon={EmailOutlinedIcon} label="Email" value={admin.email} />
                <ReadOnlyRow icon={PhoneOutlinedIcon} label="Phone" value={admin.phone || '—'} />
                <ReadOnlyRow icon={CalendarTodayOutlinedIcon} label="Member Since" value={formatDate(admin.createdAt)} />
              </>
            )}
          </Box>

          {editing && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button fullWidth variant="outlined" disabled={saving} onClick={cancelEditing} sx={{ py: 1.5 }}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" disabled={saving} startIcon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />} onClick={save} sx={{ py: 1.5 }}>
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </LoadingOverlay>
  );
}

function ReadOnlyRow({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.9 }}>
      <Icon sx={{ fontSize: 16, color: AppColors.textSecondary }} />
      <Typography sx={{ width: 100, fontSize: 13, color: AppColors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
