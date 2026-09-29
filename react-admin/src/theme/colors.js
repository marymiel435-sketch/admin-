// Mirrors lib/core/constants/app_colors.dart, extended with a dark palette.
// AppColors is a mutable singleton so existing `AppColors.xxx` reads across
// the app (evaluated at render time, not module load) pick up the active
// mode as soon as setColorMode() runs + the tree re-renders.
const lightColors = {
  primary: '#1565C0',
  primaryLight: '#1E88E5',
  primaryDark: '#0D47A1',
  secondary: '#0288D1',
  secondaryLight: '#29B6F6',
  accent: '#42A5F5',

  background: '#F0F5FF',
  surface: '#FFFFFF',
  cardSurface: '#FFFFFF',

  sidebarBg: '#08122A',
  sidebarSelected: '#1565C0',
  sidebarHover: '#0D1E40',
  sidebarText: '#8FA8C8',
  sidebarTextSelected: '#FFFFFF',

  textPrimary: '#17212B',
  textSecondary: '#667789',
  textHint: '#9AA8B5',
  textOnPrimary: '#FFFFFF',

  success: '#388E3C',
  successLight: '#E8F5E9',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  info: '#0288D1',
  infoLight: '#E1F5FE',

  statusOnline: '#4CAF50',
  statusOffline: '#9E9E9E',
  statusBusy: '#FF9800',
  statusAvailable: '#2196F3',

  divider: '#E6ECF2',
  border: '#D7E0E8',
  shadow: 'rgba(15, 23, 42, 0.08)',

  chartBlue: '#1E88E5',
  chartOrange: '#F57C00',
  chartGreen: '#388E3C',
  chartPurple: '#7B1FA2',
  chartTeal: '#00897B',
  chartRed: '#D32F2F',

  gradientPrimary: ['#0D47A1', '#1565C0'],
  gradientSecondary: ['#0288D1', '#29B6F6'],
  gradientSuccess: ['#2E7D32', '#66BB6A'],
  gradientCard1: ['#1565C0', '#1E88E5'],
  gradientCard2: ['#5E35B1', '#7E57C2'],
  gradientCard3: ['#2E7D32', '#5BAE62'],
  gradientCard4: ['#00695C', '#26A69A'],
  gradientCard5: ['#006DA3', '#0097C8'],
  gradientCard6: ['#C62828', '#E57373'],
  gradientCard7: ['#1565C0', '#42A5F5'],
  gradientCard8: ['#37474F', '#607D8B'],
};

const darkColors = {
  ...lightColors,
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#29B6F6',
  secondaryLight: '#4FC3F7',
  accent: '#60A5FA',

  background: '#0B1220',
  surface: '#131B2C',
  cardSurface: '#131B2C',

  sidebarBg: '#05080F',
  sidebarHover: '#101B33',

  textPrimary: '#E7ECF3',
  textSecondary: '#94A3B8',
  textHint: '#64748B',
  textOnPrimary: '#FFFFFF',

  successLight: 'rgba(56,142,60,0.18)',
  warningLight: 'rgba(245,124,0,0.18)',
  errorLight: 'rgba(211,47,47,0.18)',
  infoLight: 'rgba(2,136,209,0.18)',

  divider: '#232E42',
  border: '#2A3650',
  shadow: 'rgba(0, 0, 0, 0.45)',
};

export const AppColors = { ...lightColors };

export function setColorMode(mode) {
  Object.assign(AppColors, mode === 'dark' ? darkColors : lightColors);
}

export function getPalette(mode) {
  return mode === 'dark' ? darkColors : lightColors;
}
