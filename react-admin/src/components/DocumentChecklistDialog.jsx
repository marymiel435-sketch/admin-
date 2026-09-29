import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import { AppColors } from '../theme/colors';
import { formatDate } from '../utils/appUtils';

// Mirrors lib/screens/riders/office_visit_screen.dart's DocumentChecklistDialog.
// Slows the staff member down before activation: three checkboxes that must
// all be ticked, confirming the physical documents were actually compared
// against the rider standing in front of them. Nothing here is persisted to
// Firestore — it's a UI gate only, per the spec.
export default function DocumentChecklistDialog({ open, rider, onCancel, onConfirm }) {
  const [licenseChecked, setLicenseChecked] = useState(false);
  const [orCrChecked, setOrCrChecked] = useState(false);
  const [selfieChecked, setSelfieChecked] = useState(false);

  const allChecked = licenseChecked && orCrChecked && selfieChecked;

  const handleClose = () => {
    setLicenseChecked(false);
    setOrCrChecked(false);
    setSelfieChecked(false);
    onCancel();
  };

  const handleConfirm = () => {
    setLicenseChecked(false);
    setOrCrChecked(false);
    setSelfieChecked(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Verify Documents In Person</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mb: 1 }}>
          Confirm each item against the physical documents {rider.firstName} brought in:
        </Typography>
        <FormControlLabel
          sx={{ alignItems: 'flex-start', display: 'flex' }}
          control={<Checkbox checked={licenseChecked} onChange={(e) => setLicenseChecked(e.target.checked)} sx={{ pt: 0 }} />}
          label={
            <Box>
              <Typography sx={{ fontSize: 13.5 }}>Driver&apos;s license matches name &amp; photo</Typography>
              <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>
                License No. {rider.licenseNumber} · Expires {formatDate(rider.licenseExpiry)}
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          sx={{ alignItems: 'flex-start', display: 'flex' }}
          control={<Checkbox checked={orCrChecked} onChange={(e) => setOrCrChecked(e.target.checked)} sx={{ pt: 0 }} />}
          label={
            <Box>
              <Typography sx={{ fontSize: 13.5 }}>OR/CR matches the plate number</Typography>
              <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>Plate {rider.plateNumber}</Typography>
            </Box>
          }
        />
        <FormControlLabel
          sx={{ alignItems: 'flex-start', display: 'flex' }}
          control={<Checkbox checked={selfieChecked} onChange={(e) => setSelfieChecked(e.target.checked)} sx={{ pt: 0 }} />}
          label={<Typography sx={{ fontSize: 13.5 }}>Selfie-with-license matches the person present</Typography>}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!allChecked}
          onClick={handleConfirm}
          sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}
        >
          Activate Account
        </Button>
      </DialogActions>
    </Dialog>
  );
}
