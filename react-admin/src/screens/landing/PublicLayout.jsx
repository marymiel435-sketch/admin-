import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

// Fixed light palette for the public pages. These pages never follow the
// admin panel's dark-mode toggle, so every color here is explicit.
export const C = {
  navy: '#0A1630',
  navySoft: '#12234A',
  primaryDark: '#0D47A1',
  primary: '#1565C0',
  primaryLight: '#3B82F6',
  cyan: '#06B6D4',
  bg: '#F6F9FF',
  surface: '#FFFFFF',
  tint: '#EAF2FF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
};

export const GRADIENT = `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 55%, ${C.cyan} 100%)`;

// Served from public/vluerides.apk. Update APP_SIZE when the APK is replaced.
export const APP_DOWNLOAD_LINK = '/vluerides.apk';
export const APP_FILE_NAME = 'VlueRides.apk';
export const APP_SIZE = '165 MB';

// The store portal is a separate site; the Store login option goes there.
// The store owner portal (store_vluerides) is a separate React app built with
// base '/store/' and deployed into this site's /store folder, so it needs a
// full page load rather than an in-app navigate().
export const STORE_PORTAL_URL = '/store/';

// The admin theme pins body text to its own (mode-dependent) color, which made
// text vanish here in dark mode. This theme leaves Typography color to inherit.
const publicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: C.primary, dark: C.primaryDark },
    text: { primary: C.text, secondary: C.textSecondary },
    background: { default: C.bg, paper: C.surface },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: 'none', transition: 'transform .15s, box-shadow .15s, background-color .15s' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

const NAV_ITEMS = [
  { label: 'Home', section: 'home' },
  { label: 'About', section: 'about' },
  { label: 'Services', section: 'services' },
  { label: 'Tracking', section: 'tracking' },
  { label: 'Download App', path: '/download' },
];

export const primaryButtonSx = {
  background: GRADIENT,
  color: '#fff',
  fontWeight: 700,
  px: 3.5,
  py: 1.4,
  boxShadow: '0 10px 24px rgba(21,101,192,0.30)',
  '&:hover': { background: GRADIENT, transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(21,101,192,0.38)' },
};

export const ghostButtonSx = {
  color: C.text,
  fontWeight: 600,
  px: 3.5,
  py: 1.4,
  bgcolor: C.surface,
  border: `1px solid ${C.border}`,
  '&:hover': { bgcolor: C.surface, borderColor: C.primary, color: C.primary, transform: 'translateY(-2px)' },
};

export function Brand({ light }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        component="img"
        src="/vluerides-logo.png"
        alt="VlueRides logo"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 3,
          display: 'block',
          objectFit: 'cover',
          boxShadow: '0 6px 16px rgba(21,101,192,0.35)',
        }}
      />
      <Typography sx={{ fontWeight: 800, fontSize: 19, color: light ? '#fff' : C.text, letterSpacing: -0.3 }}>
        Vlue<Box component="span" sx={{ color: light ? '#7DD3FC' : C.primary }}>Rides</Box>
      </Typography>
    </Box>
  );
}

export function Eyebrow({ children, light }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: 0.6,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        color: light ? '#E0F2FE' : C.primary,
        bgcolor: light ? 'rgba(255,255,255,0.1)' : C.tint,
        border: `1px solid ${light ? 'rgba(255,255,255,0.18)' : 'rgba(21,101,192,0.15)'}`,
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: light ? '#7DD3FC' : C.primary }} />
      {children}
    </Box>
  );
}

export function GradientText({ children }) {
  return (
    <Box
      component="span"
      sx={{ background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
    >
      {children}
    </Box>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <Box sx={{ textAlign: align, maxWidth: 700, mx: align === 'center' ? 'auto' : 0, mb: { xs: 5, md: 7 } }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Typography
        component="h2"
        sx={{ color: C.text, fontWeight: 800, fontSize: { xs: 30, md: 42 }, mt: 2, lineHeight: 1.15, letterSpacing: -0.8 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: C.textSecondary, fontSize: { xs: 16, md: 17 }, mt: 2, lineHeight: 1.75 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// Soft blurred color blobs behind the hero sections.
export function HeroGlow() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'absolute',
          width: 520,
          height: 520,
          top: -180,
          right: -120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.28), transparent 65%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 460,
          height: 460,
          bottom: -220,
          left: -160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.20), transparent 65%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 85%)',
        }}
      />
    </Box>
  );
}

function FloatingCard({ Icon, color, title, text, sx }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 1.25,
        px: 1.75,
        py: 1.25,
        borderRadius: 3,
        bgcolor: C.surface,
        color: C.text,
        border: `1px solid ${C.border}`,
        boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
        zIndex: 2,
        ...sx,
      }}
    >
      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ color, fontSize: 20 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: 11.5, color: C.textMuted }}>{text}</Typography>
      </Box>
    </Box>
  );
}

// A CSS-only phone showing a live-tracking screen, used as hero artwork.
export function PhoneMockup() {
  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 420, mx: 'auto', py: 2, px: { xs: 0, sm: 6 } }}>
      <FloatingCard
        Icon={CheckCircleIcon}
        color={C.success}
        title="Order delivered"
        text="Purok 3, Poblacion"
        sx={{ top: 60, left: 0, animation: 'vrFloat 5s ease-in-out infinite' }}
      />
      <FloatingCard
        Icon={StoreMallDirectoryIcon}
        color={C.primary}
        title="Order picked up"
        text="From a local store"
        sx={{ bottom: 70, right: 0, animation: 'vrFloat 5s ease-in-out 1.5s infinite' }}
      />
      <Box
        sx={{
          '@keyframes vrFloat': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
          position: 'relative',
          width: 270,
          maxWidth: '100%',
          mx: 'auto',
          aspectRatio: '9 / 18.5',
          borderRadius: '42px',
          p: '10px',
          bgcolor: C.navy,
          boxShadow: '0 40px 80px rgba(15,23,42,0.28), inset 0 0 0 2px #25365E',
        }}
      >
        <Box sx={{ width: '100%', height: '100%', borderRadius: '33px', overflow: 'hidden', bgcolor: '#F1F5FB', display: 'flex', flexDirection: 'column' }}>
          {/* header */}
          <Box sx={{ background: GRADIENT, color: '#fff', px: 2, pt: 3, pb: 2 }}>
            <Typography sx={{ fontSize: 11, opacity: 0.85 }}>Tracking your order</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Arriving in 8 min</Typography>
          </Box>
          {/* map */}
          <Box sx={{ flex: 1, position: 'relative', bgcolor: '#E8EFF9' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <path d="M0 60 H200 M0 140 H200 M60 0 V200 M150 0 V200" stroke="#FFFFFF" strokeWidth="9" />
              <path d="M30 170 L60 170 L60 60 L150 60 L150 30" fill="none" stroke={C.primary} strokeWidth="4" strokeDasharray="7 6" strokeLinecap="round" />
            </svg>
            <Box sx={{ position: 'absolute', left: '26%', top: '48%', width: 34, height: 34, borderRadius: '50%', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px rgba(21,101,192,0.2)' }}>
              <TwoWheelerIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box sx={{ position: 'absolute', right: '20%', top: '8%', width: 30, height: 30, borderRadius: '50%', bgcolor: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px rgba(22,163,74,0.2)' }}>
              <HomeRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
            </Box>
          </Box>
          {/* rider card */}
          <Box sx={{ bgcolor: C.surface, p: 1.75, borderTop: `1px solid ${C.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DeliveryDiningIcon sx={{ color: C.primary, fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Your rider</Typography>
                <Typography sx={{ fontSize: 11, color: C.textMuted }}>On the way to you</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5 }}>
              {[1, 1, 1, 0].map((done, i) => (
                <Box key={i} sx={{ flex: 1, height: 5, borderRadius: 5, bgcolor: done ? C.primary : C.border }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function LoginRoleDialog({ open, onClose }) {
  const navigate = useNavigate();

  const option = (Icon, title, description, path) => (
    <Box
      component="button"
      type="button"
      onClick={() => (/^https?:\/\//.test(path) || path === STORE_PORTAL_URL ? window.location.assign(path) : navigate(path))}
      sx={{
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.25,
        borderRadius: 3,
        border: `1.5px solid ${C.border}`,
        bgcolor: C.surface,
        color: C.text,
        transition: 'border-color .15s, box-shadow .15s, transform .15s',
        '&:hover, &:focus-visible': {
          borderColor: C.primary,
          boxShadow: '0 12px 28px rgba(21,101,192,0.16)',
          transform: 'translateY(-2px)',
        },
        '&:hover .vr-arrow': { transform: 'translateX(3px)', color: C.primary },
      }}
    >
      <Box sx={{ width: 52, height: 52, borderRadius: 3, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ color: '#fff', fontSize: 28 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: C.text }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: C.textSecondary }}>{description}</Typography>
      </Box>
      <ArrowForwardIcon className="vr-arrow" sx={{ color: C.textMuted, transition: 'transform .15s' }} />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, bgcolor: C.surface, color: C.text } }}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(10,22,48,0.45)' } } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>Welcome back</Typography>
            <Typography sx={{ fontSize: 14, color: C.textSecondary }}>Choose how you want to log in</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close" sx={{ color: C.textMuted }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {option(AdminPanelSettingsOutlinedIcon, 'Admin', 'Manage riders, stores, orders and reports', '/login/admin')}
          {option(StorefrontOutlinedIcon, 'Store', 'For partner store owners and staff', STORE_PORTAL_URL)}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// Navbar + footer shared by the landing page and the download page.
export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isWide = useMediaQuery('(min-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (item) => Boolean(item.path) && location.pathname === item.path;

  const go = (item) => {
    setDrawerOpen(false);
    if (item.path) {
      navigate(item.path);
      window.scrollTo({ top: 0 });
    } else if (location.pathname === '/') {
      document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // LandingScreen scrolls to the hash's section once it mounts.
      navigate(`/#${item.section}`);
    }
  };

  return (
    <ThemeProvider theme={publicTheme}>
      <Box sx={{ bgcolor: C.bg, color: C.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(246,249,255,0.6)',
            backdropFilter: 'saturate(180%) blur(14px)',
            borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
            color: C.text,
            transition: 'background-color .2s, border-color .2s',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
              <Box component="button" onClick={() => go(NAV_ITEMS[0])} sx={{ all: 'unset', cursor: 'pointer' }}>
                <Brand />
              </Box>
              <Box sx={{ flex: 1 }} />
              {isWide ? (
                <>
                  <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}` }}>
                    {NAV_ITEMS.map((item) => (
                      <Button
                        key={item.label}
                        onClick={() => go(item)}
                        sx={{
                          borderRadius: 999,
                          px: 2.25,
                          py: 0.75,
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: isActive(item) ? '#fff' : C.textSecondary,
                          background: isActive(item) ? GRADIENT : 'transparent',
                          '&:hover': { color: isActive(item) ? '#fff' : C.primary, bgcolor: isActive(item) ? undefined : C.tint },
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                  <Button onClick={() => setLoginOpen(true)} sx={{ ...primaryButtonSx, ml: 1.5, py: 1, px: 3 }}>
                    Log in
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setLoginOpen(true)} sx={{ ...primaryButtonSx, py: 0.75, px: 2.25 }}>
                    Log in
                  </Button>
                  <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu" sx={{ color: C.text }}>
                    <MenuIcon />
                  </IconButton>
                </>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { bgcolor: C.surface, color: C.text, width: 280 } }}
        >
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Brand />
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: C.text }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ px: 1.5 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => go(item)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: isActive(item) ? C.primary : C.text,
                  bgcolor: isActive(item) ? C.tint : 'transparent',
                }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>

        <Box component="footer" sx={{ bgcolor: C.navy, color: '#CBD5E1', pt: 7, pb: 4 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr' },
                gap: 4,
              }}
            >
              <Box>
                <Brand light />
                <Typography sx={{ fontSize: 14, mt: 2, color: '#94A3B8', maxWidth: 320, lineHeight: 1.7 }}>
                  Local delivery for Trento, Agusan del Sur — food, pabili, bills payment and pickup & drop-off in one app.
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Explore</Typography>
                {NAV_ITEMS.map((item) => (
                  <Box
                    key={item.label}
                    component="button"
                    onClick={() => go(item)}
                    sx={{ all: 'unset', display: 'block', cursor: 'pointer', color: '#94A3B8', fontSize: 14, py: 0.6, '&:hover': { color: '#fff' } }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>Portal</Typography>
                <Box
                  component="button"
                  onClick={() => setLoginOpen(true)}
                  sx={{ all: 'unset', display: 'block', cursor: 'pointer', color: '#94A3B8', fontSize: 14, py: 0.6, '&:hover': { color: '#fff' } }}
                >
                  Admin & Store Log in
                </Box>
                <Typography sx={{ fontSize: 14, color: '#94A3B8', py: 0.6 }}>Trento, Agusan del Sur, Philippines</Typography>
              </Box>
            </Box>
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', mt: 5, pt: 3 }}>
              <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                © {new Date().getFullYear()} VlueRides. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>

        <LoginRoleDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}
