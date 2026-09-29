import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, CircularProgress, Button, IconButton, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import BlockIcon from '@mui/icons-material/Block';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MotorcycleIcon from '@mui/icons-material/TwoWheeler';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import ElectricRickshawIcon from '@mui/icons-material/ElectricRickshaw';
import StarIcon from '@mui/icons-material/Star';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import { usePresence } from '../../context/PresenceContext';
import { formatDate, getStatusColor, getStatusBgColor } from '../../utils/appUtils';
import Sparkline from '../../components/Sparkline';
import SearchBarWidget from '../../components/SearchBarWidget';
import StatusChip from '../../components/StatusChip';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DocumentChecklistDialog from '../../components/DocumentChecklistDialog';

const STATUS_FILTERS = ['all', 'Approved', 'Pending Approval', 'Documents Requested', 'Suspended', 'Rejected'];
const PAGE_SIZE = 10;

function vehicleIcon(vehicleType) {
  if (vehicleType === 'Bicycle') return PedalBikeIcon;
  if (vehicleType === 'Tricycle') return ElectricRickshawIcon;
  return MotorcycleIcon;
}

// Mirrors lib/screens/riders/riders_screen.dart
export default function RidersScreen() {
  const provider = useRiders();
  const presence = usePresence();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [checklistRider, setChecklistRider] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [wide, setWide] = useState(window.matchMedia('(min-width: 900px)').matches);

  useEffect(() => {
    provider.startListening();
    presence.startListening();
    const mq = window.matchMedia('(min-width: 900px)');
    const handler = (e) => setWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const online = presence.onlineCountFor(provider.allRiders);
  const suspended = provider.allRiders.filter((r) => r.isSuspended).length;

  const stats = [
    { label: 'Total Riders', value: provider.totalCount, icon: GroupsOutlinedIcon, bg: '#EFF6FF', color: '#2563EB' },
    { label: 'Online Now', value: online, icon: BoltOutlinedIcon, bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Pending Approval', value: provider.pendingCount, icon: PendingActionsOutlinedIcon, bg: '#FFFBEB', color: '#F59E0B' },
    { label: 'Awaiting Office Visit', value: provider.documentsRequestedCount, icon: FactCheckOutlinedIcon, bg: '#F0F9FF', color: '#0288D1' },
    { label: 'Suspended', value: suspended, icon: BlockOutlinedIcon, bg: '#FFF1F2', color: '#E11D48' },
  ];

  const total = provider.riders.length;
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
  const currentPage = Math.min(page, maxPage);
  const start = currentPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageRiders = provider.riders.slice(start, end);

  const openDetail = (rider) => navigate(`/riders/${rider.uid}`);

  const showResult = (ok, successMsg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? successMsg : 'Failed' });

  const handleMenu = async (action, rider) => {
    setMenuState(null);
    switch (action) {
      case 'edit':
        navigate(`/riders/${rider.uid}/edit`);
        break;
      case 'requestDocuments': {
        const ok = await provider.requestDocuments(rider.uid);
        showResult(ok, 'Documents requested');
        break;
      }
      case 'activateAccount':
        setChecklistRider(rider);
        break;
      case 'suspend':
        setConfirmState({ type: 'suspend', rider });
        break;
      case 'activate': {
        const ok = await provider.activateRider(rider.uid);
        showResult(ok, 'Rider reactivated');
        break;
      }
      case 'delete':
        setConfirmState({ type: 'delete', rider });
        break;
      default:
        break;
    }
  };

  const confirmAction = async () => {
    const { type, rider } = confirmState;
    setConfirmState(null);
    if (type === 'suspend') {
      const ok = await provider.suspendRider(rider.uid);
      showResult(ok, 'Rider suspended');
    } else if (type === 'delete') {
      const ok = await provider.deleteRider(rider.uid);
      showResult(ok, 'Rider deleted');
    }
  };

  return (
    <Box sx={{ p: '20px 24px 24px' }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: AppColors.textPrimary }}>Riders</Typography>
          <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>
            Manage delivery riders, approvals, and vehicle details
          </Typography>
        </Box>
        {provider.pendingCount > 0 && (
          <QueueButton
            onClick={() => navigate('/riders/pending-approvals')}
            icon={PendingActionsIcon}
            label="Pending"
            count={provider.pendingCount}
            color={AppColors.warning}
          />
        )}
        {provider.documentsRequestedCount > 0 && (
          <QueueButton
            onClick={() => navigate('/riders/office-visit')}
            icon={FactCheckOutlinedIcon}
            label="Office Visit"
            count={provider.documentsRequestedCount}
            color={AppColors.info}
          />
        )}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/riders/new')}>
          Add Rider
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={1.75} sx={{ mt: 0.5 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={2.4} key={s.label}>
            <Box
              sx={{
                p: '16px 16px 10px',
                borderRadius: '14px',
                bgcolor: s.bg,
                boxShadow: `0 6px 14px ${AppColors.shadow}`,
                height: 150,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ p: 1.25, borderRadius: '50%', bgcolor: `${s.color}22`, display: 'flex' }}>
                  <s.icon sx={{ color: s.color, fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: AppColors.textPrimary }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary, fontWeight: 500 }}>{s.label}</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Sparkline color={s.color} width={220} height={30} count={9} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box sx={{ mt: 2.25, p: 1.75, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Box sx={{ flex: 1 }}>
            <SearchBarWidget
              hint="Search name, phone, plate number..."
              value={provider.searchQuery}
              onChange={(q) => {
                provider.setSearch(q);
                setPage(0);
              }}
            />
          </Box>
          <Box
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1.5, borderRadius: '8px', bgcolor: AppColors.background, border: `1px solid ${AppColors.border}`, cursor: 'pointer' }}
          >
            <FilterListIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Filters</Typography>
            <KeyboardArrowDownIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
          </Box>
          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
            {STATUS_FILTERS.map((f) => (
              <MenuItem key={f} onClick={() => { provider.setStatusFilter(f); setPage(0); setFilterAnchor(null); }}>
                {f === 'all' ? 'All Statuses' : f}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
          {STATUS_FILTERS.map((f) => {
            const selected = provider.statusFilter === f;
            const isAll = f === 'all';
            const color = isAll ? AppColors.primary : getStatusColor(f);
            return (
              <Box
                key={f}
                onClick={() => { provider.setStatusFilter(f); setPage(0); }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 1, borderRadius: '20px', cursor: 'pointer', flexShrink: 0, bgcolor: selected ? color : isAll ? AppColors.background : getStatusBgColor(f), border: `1px solid ${selected ? color : AppColors.border}` }}
              >
                {!isAll && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: selected ? '#fff' : color }} />}
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: selected ? '#fff' : isAll ? AppColors.textSecondary : color }}>
                  {isAll ? 'All' : f}
                </Typography>
              </Box>
            );
          })}
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
        ) : provider.riders.length === 0 ? (
          <EmptyState icon={DeliveryDiningOutlinedIcon} title="No riders found" subtitle="Add a rider using the button above" actionLabel="Add Rider" onAction={() => navigate('/riders/new')} />
        ) : wide ? (
          <Box sx={{ borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 8px 18px ${AppColors.shadow}`, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', px: 2.5, py: 1.75, borderBottom: `1px solid ${AppColors.divider}` }}>
              <Typography sx={{ flex: 3, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4 }}>RIDER</Typography>
              <Typography sx={{ flex: 3, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4 }}>VEHICLE &amp; STATS</Typography>
              <Typography sx={{ flex: 2, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4 }}>STATUS</Typography>
              <Typography sx={{ width: 90, fontSize: 11, fontWeight: 700, color: AppColors.textSecondary, letterSpacing: 0.4, textAlign: 'center' }}>ACTIONS</Typography>
            </Box>
            {pageRiders.map((rider) => {
              const VehicleIcon = vehicleIcon(rider.vehicleType);
              const isOnline = presence.isRiderOnline(rider);
              return (
                <Box
                  key={rider.uid}
                  onClick={() => openDetail(rider)}
                  sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.75, borderBottom: `1px solid ${AppColors.divider}`, cursor: 'pointer', '&:hover': { bgcolor: AppColors.background } }}
                >
                  <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <CustomAvatar imageUrl={rider.profilePhotoUrl} name={rider.fullName} size={40} />
                      {isOnline && <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', bgcolor: AppColors.success, border: `2px solid ${AppColors.surface}` }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rider.fullName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 11, color: AppColors.textSecondary }} />
                        <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>{rider.phoneNumber}</Typography>
                      </Box>
                      {rider.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <MailOutlineIcon sx={{ fontSize: 11, color: AppColors.textSecondary }} />
                          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rider.email}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ p: 0.9, borderRadius: 1, bgcolor: AppColors.infoLight, display: 'flex' }}>
                      <VehicleIcon sx={{ fontSize: 15, color: AppColors.info }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1.3 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rider.vehicleType}</Typography>
                      <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>{rider.plateNumber || '—'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <StarIcon sx={{ fontSize: 13, color: AppColors.warning }} />
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{rider.rating > 0 ? rider.rating.toFixed(1) : '0.0'}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary }}>Rating</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: '6px', bgcolor: `${AppColors.chartTeal}1A` }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: AppColors.chartTeal }}>{rider.totalDeliveries}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary, mt: 0.25 }}>Deliveries</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <StatusChip status={rider.accountStatus} />
                    <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary, mt: 0.5 }}>Joined {formatDate(rider.createdAt)}</Typography>
                  </Box>
                  <Box sx={{ width: 90, display: 'flex', justifyContent: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => openDetail(rider)}>
                      <VisibilityOutlinedIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => setMenuState({ anchor: e.currentTarget, rider })}>
                      <MoreVertIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.75 }}>
              <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>
                {total === 0 ? 'No riders' : `Showing ${start + 1} to ${end} of ${total} riders`}
              </Typography>
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Box sx={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', bgcolor: AppColors.primary }}>
                <Typography sx={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{currentPage + 1}</Typography>
              </Box>
              <IconButton size="small" disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {provider.riders.map((rider) => {
              const isOnline = presence.isRiderOnline(rider);
              return (
                <Box
                  key={rider.uid}
                  onClick={() => openDetail(rider)}
                  sx={{ p: 2, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 4px 10px ${AppColors.shadow}`, cursor: 'pointer', display: 'flex', gap: 1.75 }}
                >
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <CustomAvatar imageUrl={rider.profilePhotoUrl} name={rider.fullName} size={50} />
                    {isOnline && <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: '50%', bgcolor: AppColors.success, border: `2px solid ${AppColors.surface}` }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rider.fullName}</Typography>
                      <StatusChip status={rider.accountStatus} />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.4 }}>
                      <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>{rider.phoneNumber}</Typography>
                      {rider.email && <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>{rider.email}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
                      <InfoBadge icon={MotorcycleIcon} label={rider.plateNumber || rider.vehicleType} color={AppColors.info} />
                      <InfoBadge icon={StarIcon} label={rider.rating > 0 ? rider.rating.toFixed(1) : 'No rating'} color={AppColors.warning} />
                      <InfoBadge icon={LocalShippingOutlinedIcon} label={`${rider.totalDeliveries} deliveries`} color={AppColors.chartTeal} />
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuState({ anchor: e.currentTarget, rider }); }}>
                    <MoreVertIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Menu anchorEl={menuState?.anchor} open={Boolean(menuState)} onClose={() => setMenuState(null)}>
        {menuState && [
          <MenuItem key="edit" onClick={() => handleMenu('edit', menuState.rider)}>
            <EditOutlinedIcon fontSize="small" sx={{ color: AppColors.info, mr: 1 }} /> Edit
          </MenuItem>,
          menuState.rider.isPendingApproval && (
            <MenuItem key="requestDocuments" onClick={() => handleMenu('requestDocuments', menuState.rider)}>
              <MarkEmailReadOutlinedIcon fontSize="small" sx={{ color: AppColors.info, mr: 1 }} /> Request Documents
            </MenuItem>
          ),
          menuState.rider.isDocumentsRequested && (
            <MenuItem key="activateAccount" onClick={() => handleMenu('activateAccount', menuState.rider)}>
              <VerifiedOutlinedIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Activate Account
            </MenuItem>
          ),
          menuState.rider.isApproved && (
            <MenuItem key="suspend" onClick={() => handleMenu('suspend', menuState.rider)}>
              <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} /> Suspend
            </MenuItem>
          ),
          menuState.rider.isSuspended && (
            <MenuItem key="activate" onClick={() => handleMenu('activate', menuState.rider)}>
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Reactivate
            </MenuItem>
          ),
          <MenuItem key="delete" onClick={() => handleMenu('delete', menuState.rider)} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>,
        ]}
      </Menu>

      {confirmState && (
        <ConfirmationDialog
          open
          title={confirmState.type === 'suspend' ? 'Suspend Rider' : 'Delete Rider'}
          message={
            confirmState.type === 'suspend'
              ? `Suspend ${confirmState.rider.fullName}? They cannot accept deliveries.`
              : `Permanently delete ${confirmState.rider.fullName}? This cannot be undone.`
          }
          confirmLabel={confirmState.type === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmState.type === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmState.type === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmAction}
        />
      )}

      {checklistRider && (
        <DocumentChecklistDialog
          open
          rider={checklistRider}
          onCancel={() => setChecklistRider(null)}
          onConfirm={async () => {
            const rider = checklistRider;
            setChecklistRider(null);
            const ok = await provider.activateRider(rider.uid);
            showResult(ok, 'Account activated');
          }}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function QueueButton({ onClick, icon: Icon, label, count, color }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <Icon sx={{ fontSize: 18 }} />
          <Box sx={{ position: 'absolute', top: -4, right: -6, minWidth: 14, height: 14, px: 0.3, borderRadius: '50%', bgcolor: AppColors.error, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>{count}</Typography>
          </Box>
        </Box>
      }
      sx={{ color, borderColor: color }}
    >
      {label}
    </Button>
  );
}

function InfoBadge({ icon: Icon, label, color }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.1, py: 0.6, borderRadius: 1, bgcolor: `${color}14` }}>
      <Icon sx={{ fontSize: 12, color }} />
      <Typography sx={{ fontSize: 11.5, color, fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}
