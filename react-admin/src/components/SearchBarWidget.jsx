import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/widgets/search_bar_widget.dart's SearchBarWidget
export default function SearchBarWidget({ hint, value, onChange }) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={hint}
      sx={{
        bgcolor: AppColors.surface,
        boxShadow: `0 4px 10px ${AppColors.shadow}`,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: AppColors.border },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
