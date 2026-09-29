import { Box, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { AppColors } from '../theme/colors';

// Mirrors lib/screens/riders/widgets/location_field.dart
export default function LocationField({ purok, barangay, latitude, longitude, errorText, onTap }) {
  const isSet = purok != null && barangay != null && latitude != null && longitude != null;

  return (
    <Box>
      <Box
        onClick={onTap}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.75,
          borderRadius: '12px',
          bgcolor: AppColors.background,
          border: `${errorText ? 1.5 : 1}px solid ${errorText ? AppColors.error : AppColors.border}`,
          cursor: 'pointer',
        }}
      >
        <LocationOnOutlinedIcon sx={{ color: isSet ? AppColors.primary : AppColors.textSecondary }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: isSet ? AppColors.textPrimary : AppColors.textSecondary }}>
            {isSet ? `${purok}, Barangay ${barangay}` : 'No location set'}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>
            {isSet ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "Tap to set the rider's exact location on the map"}
          </Typography>
        </Box>
        <Typography sx={{ color: AppColors.primary, fontWeight: 600, fontSize: 12.5 }}>{isSet ? 'Change' : 'Set'}</Typography>
      </Box>
      {errorText && (
        <Typography sx={{ fontSize: 11.5, color: AppColors.error, mt: 0.75, ml: 1.5 }}>{errorText}</Typography>
      )}
    </Box>
  );
}
