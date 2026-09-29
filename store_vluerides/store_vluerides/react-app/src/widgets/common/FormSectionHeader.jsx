import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Small labeled section divider used to break long forms (registration,
// resubmission) into scannable groups instead of one long field list.
export default function FormSectionHeader({ icon: Icon, title }) {
  const theme = useTheme();
  return (
    <Box display="flex" alignItems="center">
      <Icon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
      <Box width={8} />
      <Typography variant="subtitle1" fontWeight={700} color="primary">
        {title}
      </Typography>
    </Box>
  );
}
