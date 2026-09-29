import CreditCardIcon from '@mui/icons-material/CreditCard';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import { ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { auth } from '../../firebase';
import { SubscriptionState } from '../../models/store';
import { AuthService } from '../../services/authService';
import { StoreService } from '../../services/storeService';
import { buildTheme } from '../../theme';
import { ThemeModeProvider, useThemeMode } from '../../ThemeModeContext';
import NotificationBell from '../../widgets/NotificationBell';

const SIDEBAR_EXPANDED_WIDTH = 260;
// Collapsed sidebar still shows icons (just no labels) — must stay wide
// enough for a centered 20px icon plus padding.
const SIDEBAR_RAIL_WIDTH = 84;

const NAV_ITEMS = [
  { icon: StorefrontOutlinedIcon, selectedIcon: StorefrontIcon, label: 'My Products', path: '/' },
  { icon: GridViewOutlinedIcon, selectedIcon: GridViewIcon, label: 'Categories', path: '/categories' },
  { icon: StoreOutlinedIcon, selectedIcon: StoreIcon, label: 'Store Profile', path: '/profile' },
  { icon: CreditCardOutlinedIcon, selectedIcon: CreditCardIcon, label: 'Subscription', path: '/subscription' },
];

function selectedIndexFor(pathname) {
  if (pathname.startsWith('/categories')) return 1;
  if (pathname.startsWith('/profile')) return 2;
  if (pathname.startsWith('/subscription')) return 3;
  return 0;
}

function NavItem({ icon: Icon, selectedIcon: SelectedIcon, label, selected, expanded, onTap }) {
  const button = (
    <Box
      onClick={onTap}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        px: expanded ? 1.75 : 0,
        py: expanded ? 1.5 : 1.75,
        mb: 0.5,
        ml: expanded ? 0.5 : 0,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: selected ? 'primary.50' : 'transparent',
        transition: 'background-color 0.18s ease',
        '&:hover': { bgcolor: selected ? 'primary.50' : 'action.hover' },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: 'absolute',
            left: expanded ? -8 : '50%',
            bottom: expanded ? 'auto' : -2,
            top: expanded ? '50%' : 'auto',
            transform: expanded ? 'translateY(-50%)' : 'translateX(-50%)',
            width: expanded ? 4 : 20,
            height: expanded ? 20 : 3,
            borderRadius: 4,
            bgcolor: 'primary.main',
          }}
        />
      )}
      {selected ? <SelectedIcon sx={{ fontSize: 20, color: 'primary.main' }} /> : <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />}
      {expanded && (
        <Typography
          noWrap
          sx={{
            ml: 1.75,
            fontSize: 14.5,
            color: selected ? 'primary.main' : 'text.secondary',
            fontWeight: selected ? 700 : 500,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
  return expanded ? button : <Tooltip title={label}>{button}</Tooltip>;
}

function GrowPromoCard() {
  const navigate = useNavigate();
  return (
    <Box p={2} borderRadius={3} border="1px solid" borderColor="divider" bgcolor="background.default">
      <Box width={40} height={40} borderRadius={2} display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: 'primary.50' }}>
        <RocketLaunchOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      </Box>
      <Box height={12} />
      <Typography fontWeight={700} fontSize={14}>
        Grow your store
      </Typography>
      <Box height={4} />
      <Typography fontSize={12.5} color="text.secondary" sx={{ lineHeight: 1.3 }}>
        Add more products and reach more customers.
      </Typography>
      <Box height={14} />
      <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/products/new')}>
        Learn More
      </Button>
    </Box>
  );
}

function LogoutTile({ expanded }) {
  const tile = (
    <Box
      onClick={() => AuthService.signOut()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        px: expanded ? 2.5 : 0,
        py: 2.25,
        cursor: 'pointer',
      }}
    >
      <LogoutIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      {expanded && (
        <Typography sx={{ ml: 1.75, fontWeight: 600, fontSize: 14.5, color: 'text.secondary' }}>Logout</Typography>
      )}
    </Box>
  );
  return expanded ? tile : <Tooltip title="Logout">{tile}</Tooltip>;
}

function Sidebar({ selectedIndex, onSelect, expanded = true }) {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" height="100%" bgcolor="background.paper">
      <Box
        sx={{
          bgcolor: 'primary.main',
          p: expanded ? '20px' : '20px 0',
          display: 'flex',
          justifyContent: expanded ? 'flex-start' : 'center',
        }}
      >
        <Box display="flex" alignItems="center">
          <Box component="img" src={`${import.meta.env.BASE_URL}logo.png`} alt="Vlue Rides" sx={{ width: 38, height: 38, flexShrink: 0 }} />
          {expanded && (
            <Box ml={1.5}>
              <Typography sx={{ color: '#fff', fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>Vlue Rides</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 500 }}>
                Store Portal
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box flex={1} overflow="auto" px={1.5} py={2}>
        {NAV_ITEMS.map((item, i) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            selectedIcon={item.selectedIcon}
            label={item.label}
            selected={selectedIndex === i}
            expanded={expanded}
            onTap={() => {
              navigate(item.path);
              onSelect?.();
            }}
          />
        ))}
        {expanded && (
          <>
            <Box height={20} />
            <GrowPromoCard />
          </>
        )}
      </Box>
      <Divider />
      <LogoutTile expanded={expanded} />
    </Box>
  );
}

function PremiumBadge() {
  const gold = '#B8860B';
  return (
    <Tooltip title="Active paid subscription">
      <Box
        display="flex"
        alignItems="center"
        px={1.25}
        py={0.75}
        borderRadius={5}
        sx={{ bgcolor: `${gold}1F`, border: `1px solid ${gold}66` }}
      >
        <WorkspacePremiumIcon sx={{ fontSize: 16, color: gold }} />
        <Typography sx={{ ml: 0.75, fontWeight: 700, fontSize: 12.5, color: gold }}>Premium</Typography>
      </Box>
    </Tooltip>
  );
}

function OpenStatusToggle({ uid, isOpen }) {
  const [updating, setUpdating] = useState(false);
  const color = isOpen ? '#22A55A' : '#BA1A1A';

  const toggle = async (value) => {
    setUpdating(true);
    try {
      await StoreService.setOpenStatus(uid, value);
    } catch (e) {
      console.error('Could not update store status:', e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" pl={1.5} borderRadius={5} sx={{ bgcolor: `${color}14`, border: `1px solid ${color}33` }}>
      <Typography sx={{ color, fontWeight: 700, fontSize: 13 }}>{isOpen ? 'Open' : 'Closed'}</Typography>
      <Switch checked={isOpen} disabled={updating} onChange={(e) => toggle(e.target.checked)} />
    </Box>
  );
}

function StoreChip({ name }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 5,
        pl: 0.75,
        pr: 1.5,
        py: 0.75,
        transition: 'background-color 0.18s ease',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'primary.50' },
      }}
    >
      <Avatar variant="rounded" sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'primary.main' }}>
        <StorefrontIcon sx={{ fontSize: 16 }} />
      </Avatar>
      <Typography noWrap sx={{ ml: 1, maxWidth: 140, fontWeight: 600, fontSize: 13.5 }}>
        {name}
      </Typography>
      <KeyboardArrowDownIcon sx={{ ml: 0.5, fontSize: 18, color: 'text.secondary' }} />
    </Box>
  );
}

function ThemeModeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggleMode} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'primary.50' } }}>
        {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}

function TopBar({ store, uid, sidebarOpen, onMenuTap }) {
  return (
    <Box
      height={68}
      px={2.5}
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <IconButton onClick={onMenuTap} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'primary.50' } }}>
        {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
      </IconButton>
      <Box flex={1} />
      <ThemeModeToggle />
      {uid && <NotificationBell uid={uid} />}
      <Box width={4} />
      {store && (
        <Box display="flex" alignItems="center" gap={1.25}>
          {store.subscriptionState === SubscriptionState.activeSubscription && <PremiumBadge />}
          <OpenStatusToggle uid={store.uid} isOpen={store.isOpen} />
          <StoreChip name={store.storeName === '' ? 'My Store' : store.storeName} />
        </Box>
      )}
    </Box>
  );
}

// Small subscription-status strip shown above every dashboard page. A
// lapsed trial/subscription is handled by a hard redirect to
// `/subscription` in AppRouter.jsx instead, so this never needs to render
// the expired states — only the ones an owner in good standing (or
// awaiting review) should be reminded of.
function TrialBanner({ store, showCta: showCtaProp = true }) {
  const navigate = useNavigate();
  if (store == null) return null;

  let icon;
  let color;
  let message;
  let showCta = showCtaProp;

  switch (store.subscriptionState) {
    case SubscriptionState.activeTrial:
      icon = HourglassTopIcon;
      color = 'primary.main';
      message = `Free trial: ${store.trialDaysLeft} day${store.trialDaysLeft === 1 ? '' : 's'} remaining.`;
      break;
    case SubscriptionState.trialEndingSoon:
      icon = WarningAmberRoundedIcon;
      color = '#b45309';
      message = `Your free trial ends in ${store.trialDaysLeft} day${store.trialDaysLeft === 1 ? '' : 's'}. Subscribe to continue using Store features.`;
      break;
    case SubscriptionState.pendingReview:
      icon = HourglassTopIcon;
      color = 'orange';
      message = 'Payment under review.';
      showCta = false;
      break;
    default:
      return null;
  }

  const Icon = icon;
  return (
    <Box px={{ xs: 2, md: 3 }} pt={2}>
      <Box
        px={2}
        py={1.25}
        borderRadius={2.5}
        display="flex"
        alignItems="center"
        sx={{ bgcolor: `${color}14`, border: `1px solid ${color}33` }}
      >
        <Box
          width={30}
          height={30}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          sx={{ bgcolor: `${color}22` }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </Box>
        <Typography sx={{ ml: 1.5, color, fontWeight: 600, fontSize: 13, flex: 1 }}>{message}</Typography>
        {showCta && (
          <Button size="small" onClick={() => navigate('/subscription')} sx={{ flexShrink: 0 }}>
            Subscribe now
          </Button>
        )}
      </Box>
    </Box>
  );
}

function DashboardShellInner() {
  const location = useLocation();
  const wide = useMediaQuery('(min-width:900px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [store, setStore] = useState(null);
  const uid = auth.currentUser?.uid ?? null;

  useEffect(() => {
    if (!uid) return undefined;
    return StoreService.streamStore(uid, setStore);
  }, [uid]);

  const selectedIndex = selectedIndexFor(location.pathname);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="background.default" color="text.primary">
      {!wide && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box width={260} height="100%">
            <Sidebar selectedIndex={selectedIndex} onSelect={() => setDrawerOpen(false)} />
          </Box>
        </Drawer>
      )}
      <Box flex={1} display="flex" alignItems="stretch">
        {wide && (
          <Box
            width={sidebarOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_RAIL_WIDTH}
            sx={{ transition: 'width 0.26s ease', flexShrink: 0, borderRight: '1px solid', borderColor: 'divider' }}
          >
            <Sidebar selectedIndex={selectedIndex} expanded={sidebarOpen} />
          </Box>
        )}
        <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
          <TopBar
            store={store}
            uid={uid}
            sidebarOpen={sidebarOpen}
            onMenuTap={() => (wide ? setSidebarOpen((v) => !v) : setDrawerOpen(true))}
          />
          {uid && <TrialBanner store={store} showCta={location.pathname !== '/subscription'} />}
          <Box flex={1}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Only the dashboard (this component) supports a user-toggled dark mode —
// the public/marketing site and auth screens stay light-only. Scoping the
// mode provider and a fresh ThemeProvider to this subtree, rather than at
// the app root, keeps that change contained to logged-in owners.
export function DashboardShell() {
  return (
    <ThemeModeProvider>
      <DashboardThemedShell>
        <DashboardShellInner />
      </DashboardThemedShell>
    </ThemeModeProvider>
  );
}

function DashboardThemedShell({ children }) {
  const { mode } = useThemeMode();
  const dashboardTheme = useMemo(() => buildTheme(mode), [mode]);
  return <ThemeProvider theme={dashboardTheme}>{children}</ThemeProvider>;
}

// TEMP DEV PREVIEW — remove before shipping.
export function DevPreviewShell({ children }) {
  const wide = useMediaQuery('(min-width:900px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeModeProvider>
      <DashboardThemedShell>
        <Box minHeight="100vh" bgcolor="background.default" color="text.primary">
          {!wide && (
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box width={260} height="100%">
                <Sidebar selectedIndex={0} onSelect={() => setDrawerOpen(false)} />
              </Box>
            </Drawer>
          )}
          <Box display="flex" alignItems="stretch">
            {wide && sidebarOpen && (
              <Box width={260} flexShrink={0}>
                <Sidebar selectedIndex={0} />
              </Box>
            )}
            <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
              <Box height={64} px={2.5} display="flex" alignItems="center" borderBottom="1px solid" borderColor="divider">
                <IconButton onClick={() => (wide ? setSidebarOpen((v) => !v) : setDrawerOpen(true))}>
                  <MenuIcon />
                </IconButton>
                <Box flex={1} />
                <ThemeModeToggle />
                <Box width={8} />
                <IconButton disabled>
                  <NotificationsOutlinedIcon />
                </IconButton>
                <Box width={8} />
                <StoreChip name="Orashare Store" />
              </Box>
              <Box flex={1}>{children}</Box>
            </Box>
          </Box>
        </Box>
      </DashboardThemedShell>
    </ThemeModeProvider>
  );
}
