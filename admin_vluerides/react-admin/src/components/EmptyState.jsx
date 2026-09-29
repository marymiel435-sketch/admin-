import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/empty_state_widget.dart's EmptyStateWidget
export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <Box
        sx={{
          maxWidth: 420,
          p: 3.5,
          borderRadius: 1,
          bgcolor: AppColors.surface,
          border: `1px solid ${AppColors.divider}`,
          boxShadow: `0 8px 18px ${AppColors.shadow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 1,
            bgcolor: `${AppColors.primary}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 34, color: `${AppColors.primary}B3` }} />
        </Box>
        <Typography sx={{ mt: 2.25, fontSize: 17, fontWeight: 600, color: AppColors.textPrimary }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 1, fontSize: 13, color: AppColors.textSecondary }}>{subtitle}</Typography>
        )}
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction} sx={{ mt: 3 }}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// Mirrors ErrorStateWidget in the same Dart file
export function ErrorState({ message, onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, textAlign: 'center' }}>
      <ErrorOutlineIcon sx={{ fontSize: 60, color: AppColors.error }} />
      <Typography sx={{ mt: 2, fontSize: 18, fontWeight: 600, color: AppColors.textPrimary }}>
        Something went wrong
      </Typography>
      <Typography sx={{ mt: 1, fontSize: 13, color: AppColors.textSecondary }}>{message}</Typography>
      {onRetry && (
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry} sx={{ mt: 2.5 }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
