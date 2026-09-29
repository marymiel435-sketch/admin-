import { Box, Typography, TextField, MenuItem } from '@mui/material';
import { AppColors } from '../theme/colors';

// Shared building blocks for the Create/Edit Rider (and later Store) forms —
// the Dart source repeats these same section/row/field patterns verbatim
// across create_rider_screen.dart and edit_rider_screen.dart.

export function FormSection({ title, icon: Icon, accent, children }) {
  return (
    <Box sx={{ borderRadius: 2, bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
        <Box sx={{ p: 1, borderRadius: 1.25, bgcolor: `${accent}1A`, display: 'flex' }}>
          <Icon sx={{ color: accent, fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      </Box>
      <Box sx={{ borderTop: `1px solid ${AppColors.divider}`, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}

export function FormRow({ children }) {
  return <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>{children}</Box>;
}

export function FormField({ label, value, onChange, error, icon: Icon, multiline, rows, type = 'text', capitalize }) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={Boolean(error)}
      helperText={error}
      type={type}
      multiline={multiline}
      rows={rows}
      InputProps={{
        startAdornment: Icon ? <Icon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> : undefined,
        sx: capitalize ? { textTransform: 'capitalize' } : undefined,
      }}
    />
  );
}

export function FormDropdown({ label, value, onChange, options }) {
  return (
    <TextField fullWidth select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function FormDateField({ label, value, onChange, error, min, max, icon: Icon }) {
  const toInputValue = (date) => (date ? date.toISOString().slice(0, 10) : '');
  return (
    <TextField
      fullWidth
      label={label}
      type="date"
      value={toInputValue(value)}
      onChange={(e) => onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : null)}
      error={Boolean(error)}
      helperText={error}
      InputLabelProps={{ shrink: true }}
      inputProps={{ min: min ? toInputValue(min) : undefined, max: max ? toInputValue(max) : undefined }}
      InputProps={{ startAdornment: Icon ? <Icon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> : undefined }}
    />
  );
}
