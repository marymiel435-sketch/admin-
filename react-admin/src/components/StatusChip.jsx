import { Box, Typography } from '@mui/material';
import { getStatusColor, getStatusBgColor, getStatusLabel } from '../utils/appUtils';

// Mirrors lib/core/widgets/status_chip.dart
export default function StatusChip({ status, fontSize = 11 }) {
  const color = getStatusColor(status);
  const bgColor = getStatusBgColor(status);
  const label = getStatusLabel(status);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.25,
        py: 0.4,
        borderRadius: '20px',
        bgcolor: bgColor,
        border: `1px solid ${color}4D`,
        width: 'fit-content',
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ color, fontSize, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</Typography>
    </Box>
  );
}
