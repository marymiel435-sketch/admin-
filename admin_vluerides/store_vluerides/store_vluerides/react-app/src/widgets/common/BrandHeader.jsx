import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Vlue Rides wordmark used atop auth/onboarding screens for a consistent
// branded feel. No external image asset — a colored mark built from the
// app's own theme so it always matches.
export default function BrandHeader({ subtitle }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="Vlue Rides"
        sx={{ width: 64, height: 64, borderRadius: '50%', boxShadow: `0 8px 20px ${primary}59` }}
      />
      <Box height={14} />
      <Typography variant="h5" fontWeight={800} letterSpacing={0.2} color="text.primary">
        Vlue Rides
      </Typography>
      {subtitle && (
        <>
          <Box height={4} />
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {subtitle}
          </Typography>
        </>
      )}
    </Box>
  );
}
