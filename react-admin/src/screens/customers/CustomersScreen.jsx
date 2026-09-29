import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { AppColors } from '../../theme/colors';
import { useCustomers } from '../../context/CustomerContext';
import { formatDate, getTimeAgo, getStatusColor, getStatusBgColor } from '../../utils/appUtils';
import Sparkline from '../../components/Sparkline';
import SearchBarWidget from '../../components/SearchBarWidget';
import StatusChip from '../../components/StatusChip';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const STATUS_FILTERS = ['all', 'Active', 'Suspended', 'Inactive'];
const PAGE_SIZE = 10;

// Mirrors lib/screens/customers/customers_screen.dart
export default function CustomersScreen() {
  const provider = useCustomers();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [menuState, setMenuState] = useState(null); // { anchor, customer }
  const [confirmState, setConfirmState] = useState(null); // { type: 'suspend'|'delete', customer }
  const [snackbar, setSnackbar] = useState(null);
  const isWide = window.matchMedia('(min-width: 900px)').matches;
  const [wide, setWide] = useState(isWide);

  useEffect(() => {
    provider.startListening();
    const mq = window.matchMedia('(min-width: 900px)');
    const handler = (e) => setWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: 'Total Customers', value: provider.totalCount, icon: PeopleAltOutlinedIcon, bg: '#EFF6FF', color: '#2563EB' },
    { label: 'Active Customers', value: provider.activeCount, icon: CheckCircleOutlineIcon, bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Suspended Customers', value: provider.suspendedCount, icon: PauseCircleOutlineIcon, bg: '#FFFBEB', color: '#F59E0B' },
    { label: 'Inactive Customers', value: provider.inactiveCount, icon: PersonOffOutlinedIcon, bg: '#FFF1F2', color: '#E11D48' },
  ];

  const filterCount = (f) => {
    if (f === 'all') return provider.totalCount;
    if (f === 'Active') return provider.activeCount;
    if (f === 'Suspended') return provider.suspendedCount;
    return provider.inactiveCount;
  };

  const total = provider.customers.length;
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
  const currentPage = Math.min(page, maxPage);
  const start = currentPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageCustomers = provider.customers.slice(start, end);

  const openDetail = (customer) => navigate(`/customers/${customer.uid}`);

  const handleAction = async (action, customer) => {
    setMenuState(null);
    if (action === 'suspend' || action === 'delete') {
      setConfirmState({ type: action, customer });
      return;
    }
    if (action === 'activate') {
      const ok = await provider.activateCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account reactivated' : 'Failed' });
    }
  };

  const confirmAction = async () => {
    const { type, customer } = confirmState;
    setConfirmState(null);
    if (type === 'suspend') {
      const ok = await provider.suspendCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account suspended' : 'Failed' });
    } else if (type === 'delete') {
      const ok = await provider.deleteCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account deleted' : 'Failed' });
    }
  };

  return (
    <Box sx={{ p: '20px 24px 24px' }}>
      {/* Stats row */}
      <Grid container spacing={1.75}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Box
              sx={{
                p: '16px 16px 10px',
                borderRadius: '14px',
                bgcolor: AppColors.surface,
                border: `1px solid ${AppColors.divider}`,
                boxShadow: `0 6px 14px ${AppColors.shadow}`,
                height: 130,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: '50%',
                    bgcolor: s.bg,
                    display: 'flex',
                  }}
                >
                  <s.icon sx={{ color: s.color, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: AppColors.textPrimary }}>
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12.5, color: AppColors.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Sparkline color={s.color} width={220} height={28} count={8} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box
        sx={{
          mt: 2.25,
          p: 1.75,
          borderRadius: '14px',
          bgcolor: AppColors.surface,
          border: `1px solid ${AppColors.divider}`,
          boxShadow: `0 6px 14px ${AppColors.shadow}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Box sx={{ flex: 1 }}>
            <SearchBarWidget
              hint="Search name, email, phone, username..."
              value={provider.searchQuery}
              onChange={(q) => {
                provider.setSearch(q);
                setPage(0);
              }}
            />
          </Box>
          <Box
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.75,
              py: 1.5,
              borderRadius: '8px',
              bgcolor: AppColors.background,
              border: `1px solid ${AppColors.border}`,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FilterListIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: AppColors.textPrimary }}>Filters</Typography>
            <KeyboardArrowDownIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
          </Box>
          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
            {STATUS_FILTERS.map((f) => (
              <MenuItem
                key={f}
                onClick={() => {
                  provider.setStatusFilter(f);
                  setPage(0);
                  setFilterAnchor(null);
                }}
              >
                {f === 'all' ? 'All Statuses' : f}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.5 }}>
          {STATUS_FILTERS.map((f) => {
            const selected = provider.statusFilter === f;
            const isAll = f === 'all';
            const color = isAll ? AppColors.primary : getStatusColor(f);
            const label = isAll ? 'All' : f;
            return (
              <Box
                key={f}
                onClick={() => {
                  provider.setStatusFilter(f);
                  setPage(0);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.75,
                  py: 1,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  bgcolor: selected ? color : isAll ? AppColors.background : getStatusBgColor(f),
                  border: `1px solid ${selected ? color : AppColors.border}`,
                }}
              >
                {!isAll && (
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: selected ? '#fff' : color }} />
                )}
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: selected ? '#fff' : isAll ? AppColors.textSecondary : color }}>
                  {label} ({filterCount(f)})
                </Typography>
              </Box>
            );
          })}
          <Box sx={{ flex: 1 }} />
          {[
            ['Online', provider.onlineCount, AppColors.success],
            ['Active', provider.activeCount, AppColors.primary],
            ['Suspended', provider.suspendedCount, AppColors.error],
          ].map(([label, count, color]) => (
            <Box key={label} sx={{ px: 1.25, py: 0.75, borderRadius: '20px', bgcolor: `${color}14` }}>
              <Typography sx={{ fontSize: 11.5, color, fontWeight: 600 }}>
                {label}: {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ mt: 2 }}>
        {provider.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : provider.error ? (
          <ErrorState message={provider.error} />
        ) : provider.customers.length === 0 ? (
          <EmptyState
            icon={PeopleAltOutlinedIcon}
            title="No customers found"
            subtitle={provider.searchQuery ? 'Try a different search term' : 'Customers appear here after they register'}
          />
        ) : wide ? (
          <Box
            sx={{
              borderRadius: '14px',
              bgcolor: AppColors.surface,
              border: `1px solid ${AppColors.divider}`,
              boxShadow: `0 8px 18px ${AppColors.shadow}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                px: 2.5,
                py: 1.75,
                borderBottom: `1px solid ${AppColors.divider}`,
              }}
            >
              {['CUSTOMER', 'CONTACT', 'STATUS'].map((h) => (
                <Typography key={h} sx={{ flex: 3, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4 }}>
                  {h}
                </Typography>
              ))}
              <Typography sx={{ width: 90, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4, textAlign: 'center' }}>
                ACTIONS
              </Typography>
            </Box>
            {pageCustomers.map((customer) => (
              <Box
                key={customer.uid}
                onClick={() => openDetail(customer)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.75,
                  borderBottom: `1px solid ${AppColors.divider}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: AppColors.background },
                }}
              >
                <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <CustomAvatar imageUrl={customer.profileImage} name={customer.fullName} size={40} />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: -1,
                        bottom: -1,
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        bgcolor: customer.isOnline ? AppColors.success : AppColors.statusOffline,
                        border: `2px solid ${AppColors.surface}`,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: AppColors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.fullName}
                  </Typography>
                </Box>
                <Box sx={{ flex: 3, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <MailOutlineIcon sx={{ fontSize: 12, color: AppColors.textSecondary }} />
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {customer.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 12, color: AppColors.textSecondary }} />
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>{customer.phoneNumber}</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 3, display: 'flex', alignItems: 'center' }}>
                  <Box>
                    <StatusChip status={customer.accountStatus} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: customer.isOnline ? AppColors.success : AppColors.statusOffline }} />
                      <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>
                        {customer.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: AppColors.textPrimary }}>
                      {getTimeAgo(customer.createdAt)}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary }}>{formatDate(customer.createdAt)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ width: 90, display: 'flex', justifyContent: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                  <IconButton size="small" onClick={() => openDetail(customer)}>
                    <VisibilityOutlinedIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => setMenuState({ anchor: e.currentTarget, customer })}>
                    <MoreVertIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.75 }}>
              <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>
                {total === 0 ? 'No customers' : `Showing ${start + 1} to ${end} of ${total} customers`}
              </Typography>
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  bgcolor: AppColors.primary,
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{currentPage + 1}</Typography>
              </Box>
              <IconButton size="small" disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {provider.customers.map((customer) => (
              <Box
                key={customer.uid}
                onClick={() => openDetail(customer)}
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: AppColors.surface,
                  border: `1px solid ${AppColors.divider}`,
                  boxShadow: `0 4px 10px ${AppColors.shadow}`,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 1.5,
                }}
              >
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <CustomAvatar imageUrl={customer.profileImage} name={customer.fullName} size={50} />
                  <Box
                    sx={{
                      position: 'absolute',
                      right: -1,
                      bottom: -1,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: customer.isOnline ? AppColors.success : AppColors.statusOffline,
                      border: `2.5px solid ${AppColors.surface}`,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ flex: 1, fontWeight: 600, fontSize: 14, color: AppColors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {customer.fullName}
                    </Typography>
                    <StatusChip status={customer.accountStatus} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 12, color: AppColors.textSecondary }} />
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {customer.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 12, color: AppColors.textSecondary }} />
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>{customer.phoneNumber}</Typography>
                    <Typography sx={{ fontSize: 11, color: AppColors.textHint, ml: 'auto' }}>{getTimeAgo(customer.createdAt)}</Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuState({ anchor: e.currentTarget, customer }); }}>
                  <MoreVertIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Menu anchorEl={menuState?.anchor} open={Boolean(menuState)} onClose={() => setMenuState(null)}>
        {menuState && (
          <MenuItem onClick={() => handleAction(menuState.customer.accountStatus === 'Suspended' ? 'activate' : 'suspend', menuState.customer)}>
            {menuState.customer.accountStatus === 'Suspended' ? (
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} />
            ) : (
              <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} />
            )}
            {menuState.customer.accountStatus === 'Suspended' ? 'Reactivate' : 'Suspend'}
          </MenuItem>
        )}
        {menuState && (
          <MenuItem onClick={() => handleAction('delete', menuState.customer)} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {confirmState && (
        <ConfirmationDialog
          open
          title={confirmState.type === 'suspend' ? 'Suspend Account' : 'Delete Account'}
          message={
            confirmState.type === 'suspend'
              ? `Suspend ${confirmState.customer.fullName}'s account? They cannot place orders.`
              : `Permanently delete ${confirmState.customer.fullName}'s account? This also deletes their profile image and login. This cannot be undone.`
          }
          confirmLabel={confirmState.type === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmState.type === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmState.type === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmAction}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
