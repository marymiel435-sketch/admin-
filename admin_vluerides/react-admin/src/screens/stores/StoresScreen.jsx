import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, CircularProgress, Button, IconButton, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import { formatDate } from '../../utils/appUtils';
import SearchBarWidget from '../../components/SearchBarWidget';
import StatusChip from '../../components/StatusChip';
import SubscriptionStateChip from '../../components/SubscriptionStateChip';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import PabiliCategoriesDialog from '../../components/PabiliCategoriesDialog';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'Suspended'];
const STATUS_ICONS = { Pending: ScheduleIcon, Approved: CheckCircleOutlineIcon, Rejected: CancelOutlinedIcon, Suspended: PauseCircleOutlineIcon };
const STATUS_COLORS = { Pending: AppColors.warning, Approved: AppColors.success, Rejected: AppColors.error, Suspended: '#7C3AED' };
const CATEGORY_ICONS = { 'Food Store': RestaurantIcon, 'Pabili Store': ShoppingBagOutlinedIcon, Bills: ReceiptLongOutlinedIcon };
const CATEGORY_COLORS = { 'Food Store': '#F59E0B', 'Pabili Store': AppColors.primary, Bills: '#7C3AED' };

function statusDateLabel(store) {
  const date = formatDate(store.updatedAt);
  if (store.accountStatus === 'Approved') return `Approved on ${date}`;
  if (store.accountStatus === 'Rejected') return `Rejected on ${date}`;
  if (store.accountStatus === 'Suspended') return `Suspended on ${date}`;
  return `Pending since ${formatDate(store.createdAt)}`;
}

// Mirrors lib/screens/stores/stores_screen.dart
export default function StoresScreen() {
  const provider = useStores();
  const navigate = useNavigate();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [menuState, setMenuState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [pabiliOpen, setPabiliOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [wide, setWide] = useState(window.matchMedia('(min-width: 700px)').matches);

  useEffect(() => {
    provider.startListening();
    const mq = window.matchMedia('(min-width: 700px)');
    const handler = (e) => setWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showResult = (ok, msg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? msg : 'Failed' });

  const handleAction = async (action, store) => {
    setMenuState(null);
    switch (action) {
      case 'view':
        navigate(`/stores/${store.id}`);
        break;
      case 'edit':
        navigate(`/stores/${store.id}/edit`);
        break;
      case 'approve': {
        const ok = await provider.approveStore(store.id);
        showResult(ok, 'Store approved');
        break;
      }
      case 'suspend':
        setConfirmState({ type: 'suspend', store });
        break;
      case 'activate': {
        const ok = await provider.activateStore(store.id);
        showResult(ok, 'Store reactivated');
        break;
      }
      case 'delete':
        setConfirmState({ type: 'delete', store });
        break;
      default:
        break;
    }
  };

  const confirmAction = async () => {
    const { type, store } = confirmState;
    setConfirmState(null);
    if (type === 'suspend') {
      const ok = await provider.suspendStore(store.id);
      showResult(ok, 'Store suspended');
    } else if (type === 'delete') {
      const ok = await provider.deleteStore(store.id);
      showResult(ok, 'Store deleted');
    }
  };

  return (
    <Box sx={{ p: '20px 24px 24px' }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <Box sx={{ flex: 1 }}>
          <SearchBarWidget hint="Search store name, owner, address..." value={provider.searchQuery} onChange={provider.setSearch} />
        </Box>
        <Button variant="outlined" startIcon={<CategoryOutlinedIcon />} onClick={() => setPabiliOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
          Pabili Categories
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/new')} sx={{ whiteSpace: 'nowrap' }}>
          Add Store
        </Button>
      </Box>

      {/* Filter pills */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <Pill icon={GridViewRoundedIcon} label={`All (${provider.totalCount})`} color={AppColors.primary} selected={provider.statusFilter === 'all'} onClick={() => provider.setStatusFilter('all')} />
        {STATUS_FILTERS.map((s) => (
          <Pill
            key={s}
            icon={STATUS_ICONS[s]}
            label={`${s} (${provider.allStores.filter((st) => st.accountStatus === s).length})`}
            color={STATUS_COLORS[s]}
            selected={provider.statusFilter === s}
            onClick={() => provider.setStatusFilter(s)}
          />
        ))}
        <Box sx={{ width: '1px', height: 22, bgcolor: AppColors.divider }} />
        {['Food Store', 'Pabili Store'].map((c) => (
          <Pill
            key={c}
            icon={CATEGORY_ICONS[c]}
            label={`${c} (${provider.allStores.filter((st) => st.category === c).length})`}
            color={CATEGORY_COLORS[c]}
            selected={provider.categoryFilter === c}
            onClick={() => provider.setCategoryFilter(provider.categoryFilter === c ? 'all' : c)}
          />
        ))}
        <Box
          onClick={(e) => setMoreAnchor(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 1.25, borderRadius: '10px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.border}`, cursor: 'pointer' }}
        >
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>More</Typography>
          <KeyboardArrowDownIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
        </Box>
        <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
          <MenuItem
            onClick={() => {
              setMoreAnchor(null);
              provider.setCategoryFilter(provider.categoryFilter === 'Bills' ? 'all' : 'Bills');
            }}
          >
            <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#7C3AED', mr: 1 }} /> Bills
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMoreAnchor(null);
              navigate('/stores/pending-approvals');
            }}
          >
            <PendingActionsIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} /> Pending Approvals
          </MenuItem>
        </Menu>
      </Box>

      {/* Body */}
      <Box sx={{ mt: 2 }}>
        {provider.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : provider.error ? (
          <ErrorState message={provider.error} onRetry={provider.retry} />
        ) : provider.stores.length === 0 ? (
          <EmptyState
            icon={StoreOutlinedIcon}
            title="No stores found"
            subtitle={provider.hasActiveFilters ? 'Try adjusting your search or filters' : 'Add a store to get started'}
            actionLabel={provider.hasActiveFilters ? undefined : 'Add Store'}
            onAction={provider.hasActiveFilters ? undefined : () => navigate('/stores/new')}
          />
        ) : (
          <Grid container spacing={2}>
            {provider.stores.map((store) => (
              <Grid item xs={12} md={wide ? 6 : 12} lg={4} key={store.id}>
                <StoreCard store={store} onOpen={() => navigate(`/stores/${store.id}`)} onMenu={(e) => setMenuState({ anchor: e.currentTarget, store })} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Menu anchorEl={menuState?.anchor} open={Boolean(menuState)} onClose={() => setMenuState(null)}>
        {menuState && [
          <MenuItem key="view" onClick={() => handleAction('view', menuState.store)}>
            <VisibilityOutlinedIcon fontSize="small" sx={{ color: AppColors.primary, mr: 1 }} /> View Details
          </MenuItem>,
          <MenuItem key="edit" onClick={() => handleAction('edit', menuState.store)}>
            <EditOutlinedIcon fontSize="small" sx={{ color: AppColors.info, mr: 1 }} /> Edit Store
          </MenuItem>,
          menuState.store.isPending && (
            <MenuItem key="approve" onClick={() => handleAction('approve', menuState.store)}>
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Approve
            </MenuItem>
          ),
          (menuState.store.isApproved || menuState.store.isSuspended) && (
            <MenuItem key="suspend" onClick={() => handleAction(menuState.store.isSuspended ? 'activate' : 'suspend', menuState.store)}>
              {menuState.store.isSuspended ? (
                <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} />
              ) : (
                <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} />
              )}
              {menuState.store.isSuspended ? 'Reactivate' : 'Suspend'}
            </MenuItem>
          ),
          <MenuItem key="delete" onClick={() => handleAction('delete', menuState.store)} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>,
        ]}
      </Menu>

      {confirmState && (
        <ConfirmationDialog
          open
          title={confirmState.type === 'suspend' ? 'Suspend Store' : 'Delete Store'}
          message={
            confirmState.type === 'suspend'
              ? `Suspend ${confirmState.store.name}? It will be hidden from customers.`
              : `Permanently delete ${confirmState.store.name}? This also deletes its products, images, and subscription payment records. This cannot be undone.`
          }
          confirmLabel={confirmState.type === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmState.type === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmState.type === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmAction}
        />
      )}

      <PabiliCategoriesDialog open={pabiliOpen} onClose={() => setPabiliOpen(false)} />

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function Pill({ icon: Icon, label, color, selected, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1.25, borderRadius: '10px', cursor: 'pointer', bgcolor: selected ? color : AppColors.surface, border: `1px solid ${selected ? color : AppColors.border}` }}
    >
      <Icon sx={{ fontSize: 15, color: selected ? '#fff' : color }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: selected ? '#fff' : AppColors.textPrimary }}>{label}</Typography>
    </Box>
  );
}

function StoreCard({ store, onOpen, onMenu }) {
  const statusColor = STATUS_COLORS[store.accountStatus] ?? AppColors.textSecondary;
  const categoryColor = CATEGORY_COLORS[store.category] ?? AppColors.primary;
  const CategoryIcon = CATEGORY_ICONS[store.category] ?? StorefrontOutlinedIcon;

  return (
    <Box
      onClick={onOpen}
      sx={{ borderRadius: '16px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box sx={{ p: '16px 12px 12px 16px', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <CustomAvatar imageUrl={store.logoUrl} name={store.name} size={46} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, px: 1, py: 0.35, borderRadius: '6px', bgcolor: `${categoryColor}1A` }}>
            <CategoryIcon sx={{ fontSize: 11, color: categoryColor }} />
            <Typography sx={{ fontSize: 10.5, color: categoryColor, fontWeight: 700 }}>{store.category}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <StatusChip status={store.accountStatus} />
          <IconButton size="small" onClick={onMenu}>
            <MoreVertIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 2, display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: AppColors.textSecondary, mt: 0.15 }} />
        <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {store.address}
        </Typography>
      </Box>

      <Box sx={{ px: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <StarIcon sx={{ fontSize: 14, color: '#FFC107' }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{store.rating.toFixed(1)}</Typography>
        <Typography sx={{ color: AppColors.divider }}>|</Typography>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 13, color: AppColors.textSecondary }} />
        <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>{store.totalOrders} orders</Typography>
      </Box>

      <Box sx={{ px: 2, mt: 1 }}>
        <SubscriptionStateChip state={store.subscriptionState} />
      </Box>

      <Box sx={{ flex: 1 }} />
      <Box sx={{ width: '100%', px: 2, py: 1.25, bgcolor: `${statusColor}14`, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: statusColor }} />
        <Typography sx={{ fontSize: 11.5, color: statusColor, fontWeight: 600 }}>{statusDateLabel(store)}</Typography>
      </Box>
    </Box>
  );
}
