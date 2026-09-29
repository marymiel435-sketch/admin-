import { Avatar } from '@mui/material';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/custom_avatar.dart — falls back to initials on a
// colored circle when there's no image (Storage CORS workarounds from the
// Flutter version aren't needed here — a plain <img src> works fine).
function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function CustomAvatar({ imageUrl, name, size = 36, backgroundColor = AppColors.primary }) {
  return (
    <Avatar
      src={imageUrl || undefined}
      sx={{ width: size, height: size, bgcolor: backgroundColor, fontSize: size * 0.4, fontWeight: 600 }}
    >
      {!imageUrl && initials(name)}
    </Avatar>
  );
}
