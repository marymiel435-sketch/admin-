import { createTheme } from '@mui/material/styles';
import { getPalette } from './colors';

// Mirrors lib/core/constants/app_theme.dart, extended with a dark variant
// and shared visual polish (hover elevation, focus rings, smoother motion).
export function createAppTheme(mode = 'light') {
  const AppColors = getPalette(mode);

  return createTheme({
    palette: {
      mode,
      primary: { main: AppColors.primary, dark: AppColors.primaryDark, light: AppColors.primaryLight },
      secondary: { main: AppColors.secondary, light: AppColors.secondaryLight },
      error: { main: AppColors.error, light: AppColors.errorLight },
      warning: { main: AppColors.warning, light: AppColors.warningLight },
      info: { main: AppColors.info, light: AppColors.infoLight },
      success: { main: AppColors.success, light: AppColors.successLight },
      background: { default: AppColors.background, paper: AppColors.surface },
      text: { primary: AppColors.textPrimary, secondary: AppColors.textSecondary },
      divider: AppColors.divider,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: 32, fontWeight: 700, color: AppColors.textPrimary },
      h2: { fontSize: 28, fontWeight: 700, color: AppColors.textPrimary },
      h3: { fontSize: 24, fontWeight: 700, color: AppColors.textPrimary },
      h4: { fontSize: 20, fontWeight: 600, color: AppColors.textPrimary },
      h5: { fontSize: 18, fontWeight: 600, color: AppColors.textPrimary },
      h6: { fontSize: 16, fontWeight: 500, color: AppColors.textPrimary },
      body1: { fontSize: 15, color: AppColors.textPrimary },
      body2: { fontSize: 14, color: AppColors.textSecondary },
      caption: { fontSize: 12, color: AppColors.textSecondary },
      button: { fontSize: 14, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 180ms ease, color 180ms ease',
            scrollbarColor: `${AppColors.border} transparent`,
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: AppColors.border, borderRadius: 8 },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: `1px solid ${AppColors.divider}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            transition: 'box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'box-shadow 150ms ease, transform 150ms ease, background-color 150ms ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 6px 16px ${AppColors.primary}40`, transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
          },
          outlined: {
            '&:hover': { borderColor: AppColors.primary, backgroundColor: `${AppColors.primary}0D` },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { transition: 'background-color 150ms ease, transform 150ms ease' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: AppColors.surface,
            transition: 'box-shadow 150ms ease, border-color 150ms ease',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1.5,
              boxShadow: `0 0 0 3px ${AppColors.primary}26`,
            },
          },
          notchedOutline: { borderColor: AppColors.border },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: AppColors.surface, color: AppColors.textPrimary, boxShadow: 'none' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14, backgroundImage: 'none' },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 120ms ease',
            '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(21,101,192,0.04)' },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? '#1E293B' : '#1F2937',
            fontSize: 11.5,
            borderRadius: 6,
            padding: '6px 10px',
          },
        },
      },
    },
  });
}

// Default export kept for any lingering static imports.
export const theme = createAppTheme('light');
