import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Tooltip,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleIcon from '@mui/icons-material/Circle';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { AppColors } from '../theme/colors';
import { navItems } from './navItems';
import { useThemeMode } from '../context/ThemeModeContext';
import { useAuth } from '../context/AuthContext';
import { useRiders } from '../context/RiderContext';
import { useStores } from '../context/StoreContext';
import { usePresence } from '../context/PresenceContext';
import { useSosAlerts } from '../context/SosAlertContext';
import CustomAvatar from '../components/CustomAvatar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import BlinkingDot from '../components/BlinkingDot';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COMPACT = 72;

// Mirrors lib/screens/layout/admin_layout.dart
export default function AdminLayout() {
  const auth = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const riders = useRiders();
  const stores = useStores();
  const presence = usePresence();
  const sosAlerts = useSosAlerts();
  const navigate = useNavigate();
  const location = useLocation();
  const isWide = useMediaQuery('(min-width:900px)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Presence + SOS are used across Dashboard/Riders/Live Tracking/sidebar, so
  // start them once for the whole admin session rather than per-screen.
  useEffect(() => {
    presence.startListening();
    sosAlerts.startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const compact = isWide && sidebarCollapsed;
  const activeIndex = navItems.findIndex((item) => location.pathname.startsWith(item.path));

  const pendingCountFor = (badge) => {
    if (badge === 'riders') return riders.pendingCount;
    if (badge === 'stores') return stores.pendingCount;
    if (badge === 'subscriptions') return stores.pendingSubscriptionCount;
    return 0;
  };

  const goTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const switchTab = (index) => {
    navigate(navItems[index].path);
    setDrawerOpen(false);
  };

  // The notifications bell badges the sum of three unrelated pending queues
  // (riders, stores, subscription payments), each living on a different tab
  // — unlike the SOS badge, tapping it can't just jump to one fixed screen.
  const openNotificationsOverview = () => {
    const riderCount = riders.pendingCount;
    const storeCount = stores.pendingCount;
    const subCount = stores.pendingSubscriptionCount;
    // Exactly one pending item anywhere — jump straight to it.
    if (riderCount + storeCount + subCount === 1) {
      if (riderCount === 1) switchTab(2);
      else if (storeCount === 1) switchTab(7);
      else switchTab(8);
      return;
    }
    setNotificationsOpen(true);
  };

  const openSosAlert = () => {
    switchTab(1);
    sosAlerts.markAllSeen();
  };

  const sidebarContent = (
    <Box
      sx={{
        width: compact ? SIDEBAR_WIDTH_COMPACT : SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #11214D 0%, #060B1A 55%, #03050B 100%)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        transition: 'width 220ms ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: compact ? 1.5 : 2.5,
          py: 2.75,
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${AppColors.primary}59, transparent)`,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          component="img"
          src="/vluerides-logo.png"
          alt="VlueRides logo"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            display: 'block',
            boxShadow: `0 4px 10px ${AppColors.primary}66`,
            flexShrink: 0,
          }}
        />
        {!compact && (
          <Box sx={{ ml: 1.5, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Typography sx={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }}>
              VLUE RIDES
            </Typography>
            <Typography sx={{ color: '#6B94C8', fontSize: 10.5 }}>Admin Panel</Typography>
          </Box>
        )}
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {navItems.map((item, i) => {
          const selected = i === activeIndex;
          const Icon = selected ? item.activeIcon : item.icon;
          return (
            <Box key={item.path} sx={{ px: 1, py: 0.25 }}>
              <Box
                onClick={() => goTo(item.path)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.75,
                  py: 1.4,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selected
                    ? 'linear-gradient(90deg, #1E50DA, #2563EB, #1E8FCF)'
                    : 'transparent',
                  boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                  '&:hover': { background: selected ? undefined : 'rgba(255,255,255,0.06)' },
                }}
              >
                {selected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: '2px',
                      bgcolor: '#fff',
                    }}
                  />
                )}
                <Box sx={{ position: 'relative', display: 'flex' }}>
                  <Icon sx={{ color: selected ? '#fff' : AppColors.sidebarText, fontSize: 20 }} />
                  {item.badge === 'sos' && sosAlerts.hasUnseenAlert && (
                    <Box sx={{ position: 'absolute', top: -4, right: -6 }}>
                      <BlinkingDot />
                    </Box>
                  )}
                  {item.badge !== 'sos' && pendingCountFor(item.badge) > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -4,
                        right: -6,
                        minWidth: 14,
                        height: 14,
                        px: 0.3,
                        borderRadius: '50%',
                        bgcolor: AppColors.error,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>
                        {pendingCountFor(item.badge) > 9 ? '9+' : pendingCountFor(item.badge)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {!compact && (
                  <Typography
                    sx={{
                      ml: 1.5,
                      color: selected ? '#fff' : AppColors.sidebarText,
                      fontSize: 13.5,
                      fontWeight: selected ? 600 : 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer: profile + logout */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box
          onClick={() => navigate('/profile')}
          sx={{
            m: 1,
            mb: 0.5,
            p: 0.75,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <CustomAvatar imageUrl={auth.admin?.photoUrl} name={auth.admin?.name || 'Admin'} size={36} />
          {!compact && (
            <Box sx={{ ml: 1.25, display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {auth.admin?.name || 'Admin'}
                </Typography>
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {auth.admin?.email || auth.adminEmail || ''}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
            </Box>
          )}
        </Box>
        <Box
          onClick={() => setLogoutOpen(true)}
          sx={{
            m: 1,
            p: 1.4,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            bgcolor: 'rgba(255,0,0,0.08)',
          }}
        >
          <LogoutIcon sx={{ color: '#ef9a9a', fontSize: 20 }} />
          {!compact && (
            <Typography sx={{ ml: 1.5, color: '#ef9a9a', fontSize: 13.5, fontWeight: 500 }}>Logout</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: AppColors.background }}>
      {isWide ? (
        sidebarContent
      ) : (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebarContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <Box
          sx={{
            height: 72,
            px: 2.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            bgcolor: AppColors.surface,
            borderBottom: `1px solid ${AppColors.divider}`,
            boxShadow: `0 3px 12px ${AppColors.primary}0A`,
          }}
        >
          <Tooltip title={isWide ? (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open menu'}>
            <IconButton
              onClick={() => (isWide ? setSidebarCollapsed((v) => !v) : setDrawerOpen(true))}
              sx={{ color: AppColors.textPrimary }}
            >
              {isWide && sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 1 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: AppColors.textPrimary, letterSpacing: 0.2 }}>
              {navItems[activeIndex]?.label ?? ''}
            </Typography>
            <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>
              Welcome back, {(auth.admin?.name || 'Admin').trim().split(' ')[0]}!
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {sosAlerts.hasUnseenAlert && (
            <Box
              onClick={openSosAlert}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.9,
                mr: 1.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '20px',
                bgcolor: AppColors.errorLight,
                border: `1px solid ${AppColors.error}4D`,
                cursor: 'pointer',
              }}
            >
              <BlinkingDot size={9} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: AppColors.error, letterSpacing: 0.3 }}>
                SOS ALERT
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.6,
              borderRadius: '20px',
              bgcolor: AppColors.successLight,
              border: `1px solid ${AppColors.success}38`,
            }}
          >
            <CircleIcon sx={{ fontSize: 7, color: AppColors.success }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: AppColors.success, letterSpacing: 0.3 }}>
              Live
            </Typography>
          </Box>

          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleMode}
              sx={{ ml: 1.75, bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}` }}
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon sx={{ color: AppColors.textSecondary, fontSize: 20 }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ color: AppColors.textSecondary, fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 1.75, position: 'relative' }}>
            <IconButton
              onClick={openNotificationsOverview}
              sx={{ bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}` }}
            >
              <NotificationsOutlinedIcon sx={{ color: AppColors.textSecondary, fontSize: 20 }} />
            </IconButton>
            {riders.pendingCount + stores.pendingCount + stores.pendingSubscriptionCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  px: 0.4,
                  borderRadius: '50%',
                  bgcolor: AppColors.error,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>
                  {riders.pendingCount + stores.pendingCount + stores.pendingSubscriptionCount > 9
                    ? '9+'
                    : riders.pendingCount + stores.pendingCount + stores.pendingSubscriptionCount}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ ml: 1.75 }}>
            <IconButton onClick={() => navigate('/profile')}>
              <CustomAvatar imageUrl={auth.admin?.photoUrl} name={auth.admin?.name || 'Admin'} size={36} />
            </IconButton>
          </Box>
        </Box>

        {/* Screen content */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Outlet />
        </Box>
      </Box>

      <ConfirmationDialog
        open={logoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        confirmColor={AppColors.error}
        icon={LogoutIcon}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          auth.signOut();
        }}
      />

      <Dialog open={notificationsOpen} onClose={() => setNotificationsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderRadius: '16px 16px 0 0' }}>Pending Items</DialogTitle>
        <DialogContent>
          <NotificationRow
            icon={DeliveryDiningOutlinedIcon}
            label="Riders awaiting approval"
            count={riders.pendingCount}
            onClick={() => {
              setNotificationsOpen(false);
              switchTab(2);
            }}
          />
          <NotificationRow
            icon={StoreOutlinedIcon}
            label="Stores awaiting approval"
            count={stores.pendingCount}
            onClick={() => {
              setNotificationsOpen(false);
              switchTab(7);
            }}
          />
          <NotificationRow
            icon={WorkspacePremiumOutlinedIcon}
            label="Subscription payments to review"
            count={stores.pendingSubscriptionCount}
            onClick={() => {
              setNotificationsOpen(false);
              switchTab(8);
            }}
          />
          {riders.pendingCount + stores.pendingCount + stores.pendingSubscriptionCount === 0 && (
            <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, py: 1.5 }}>Nothing pending right now.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function NotificationRow({ icon: Icon, label, count, onClick }) {
  return (
    <Box
      onClick={count === 0 ? undefined : onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1, cursor: count === 0 ? 'default' : 'pointer' }}
    >
      <Icon sx={{ fontSize: 18, color: count > 0 ? AppColors.primary : AppColors.textSecondary }} />
      <Typography sx={{ flex: 1, fontSize: 13, color: count > 0 ? AppColors.textPrimary : AppColors.textSecondary }}>{label}</Typography>
      <Box sx={{ px: 1, py: 0.3, borderRadius: '10px', bgcolor: count > 0 ? AppColors.error : AppColors.divider }}>
        <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{count}</Typography>
      </Box>
    </Box>
  );
}
