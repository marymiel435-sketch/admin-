import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { AppColors } from '../theme/colors';

// Shared reject-with-reason dialog. The Dart source repeats near-identical
// dialogs across screens with two variants: rider rejection (pending
// pending_approvals_screen.dart/office_visit_screen.dart/
// rider_detail_screen.dart) enforces a 10-char minimum; store/subscription
// rejection (pending_store_approvals_screen.dart/store_detail_screen.dart/
// subscription_review_screen.dart) only requires non-empty. minLength lets
// one component serve both without changing either's validation behavior.
export default function RejectReasonDialog({ open, title, prompt, minLength = 10, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const isValid = reason.trim().length >= minLength;

  const handleClose = () => {
    setReason('');
    onCancel();
  };

  const handleConfirm = () => {
    const value = reason.trim();
    setReason('');
    onConfirm(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mb: 1.5 }}>{prompt}</Typography>
        <TextField
          fullWidth
          autoFocus
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Documents unclear, expired license..."
          error={reason.length > 0 && !isValid}
          helperText={
            minLength > 1
              ? reason.length > 0 && !isValid
                ? `Reason must be at least ${minLength} characters`
                : `Minimum ${minLength} characters — shown to the rider.`
              : undefined
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!isValid}
          onClick={handleConfirm}
          sx={{ bgcolor: AppColors.error, '&:hover': { bgcolor: AppColors.error } }}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
