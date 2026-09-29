import { Box } from '@mui/material';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/blinking_dot.dart
export default function BlinkingDot({ size = 8 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: AppColors.error,
        animation: 'vlue-blink 1s ease-in-out infinite',
        '@keyframes vlue-blink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
      }}
    />
  );
}
