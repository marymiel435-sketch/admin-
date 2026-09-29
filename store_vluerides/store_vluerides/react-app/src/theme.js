import { createTheme } from '@mui/material/styles';

// Vlue Rides brand blue — mirrors the Flutter app's Material 3 seed color
// (lib/main.dart) that every other theme color was generated from. The dark
// variant is lightened so it still passes contrast against a dark surface.
const BRAND_LIGHT = '#1565C0';
const BRAND_DARK = '#5B9BFF';

// Builds a full theme for a given palette mode. Used directly for the
// dashboard (which supports a user-toggled light/dark mode — see
// ThemeModeContext) and pinned to 'light' for the public/marketing and
// auth screens via the default `theme` export below.
export function buildTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      // `50` is a custom light-tint shade (not a default MUI palette key)
      // used throughout the app for selected/hover backgrounds — the
      // Material 3 "primaryContainer" equivalent.
      primary: {
        main: isDark ? BRAND_DARK : BRAND_LIGHT,
        50: isDark ? 'rgba(91,155,255,0.16)' : '#EAF1FC',
      },
      background: {
        default: isDark ? '#0B0E14' : '#F7F8FA',
        paper: isDark ? '#12151D' : '#FFFFFF',
      },
      divider: isDark ? 'rgba(255,255,255,0.09)' : '#E4E7EC',
      text: {
        primary: isDark ? '#EDEFF3' : '#111827',
        secondary: isDark ? '#9AA4B2' : '#667085',
      },
      error: { main: isDark ? '#F87171' : '#BA1A1A' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: 'none' },
        },
        defaultProps: { elevation: 0 },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
          },
          contained: {
            paddingTop: 11,
            paddingBottom: 11,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            borderRadius: 14,
            border: `1px solid ${t.palette.divider}`,
            boxShadow: 'none',
          }),
        },
      },
      MuiPaper: {
        // MUI's default dark mode adds a lightening overlay gradient to
        // Paper based on elevation — disable it so dark surfaces stay a
        // single flat, intentional color instead of blotchy layers.
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  });
}

// The public marketing site and auth screens always render in light mode —
// only the authenticated dashboard (DashboardShell) offers a dark mode
// toggle, via its own nested ThemeProvider built from buildTheme().
export const theme = buildTheme('light');
