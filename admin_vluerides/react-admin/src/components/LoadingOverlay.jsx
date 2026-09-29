import { Box, CircularProgress, Typography } from '@mui/material';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/loading_overlay.dart's LoadingOverlay
export default function LoadingOverlay({ isLoading, message, children }) {
  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {children}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(15,23,42,0.35)',
          }}
        >
          <Box
            sx={{
              px: 4,
              py: 3,
              borderRadius: 2,
              bgcolor: AppColors.surface,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            }}
          >
            <CircularProgress sx={{ color: AppColors.primary }} />
            {message && <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>{message}</Typography>}
          </Box>
        </Box>
      )}
    </Box>
  );
}
