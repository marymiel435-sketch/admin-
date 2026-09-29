import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/confirmation_dialog.dart
export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = AppColors.primary,
  icon: Icon,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {Icon && <Icon sx={{ color: confirmColor }} />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: AppColors.textSecondary }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ bgcolor: confirmColor, '&:hover': { bgcolor: confirmColor } }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
