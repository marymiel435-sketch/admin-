import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Divider } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { AppColors } from '../../theme/colors';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency, getTimeAgo, getServiceTypeColor, getServiceTypeIcon } from '../../utils/appUtils';
import { SERVICE_TYPES } from '../../models/deliveryRequestModel';
import SearchBarWidget from '../../components/SearchBarWidget';
import StatusChip from '../../components/StatusChip';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const STATUS_FILTERS = ['all', 'active', 'completed', 'cancelled'];

// Mirrors lib/screens/orders/orders_screen.dart
export default function OrdersScreen() {
  const provider = useOrders();
  const navigate = useNavigate();
  const [confirmState, setConfirmState] = useState(null); // { type, delivery }

  useEffect(() => {
    provider.startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (delivery) => navigate(`/orders/${delivery.id}`);

  const confirmAction = async () => {
    const { type, delivery } = confirmState;
    setConfirmState(null);
    if (type === 'cancel') await provider.cancelDelivery(delivery.id);
    else await provider.deleteDelivery(delivery.id);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ bgcolor: AppColors.surface, p: '16px 16px 10px' }}>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Box sx={{ flex: 1 }}>
            <SearchBarWidget hint="Search customer, rider, address..." value={provider.searchQuery} onChange={provider.setSearch} />
          </Box>
          <Badge label="Active" count={provider.activeCount} color={AppColors.primary} />
          <Badge label="Done" count={provider.completedCount} color={AppColors.success} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, overflowX: 'auto', pb: 0.5 }}>
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f}
              label={f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
              selected={provider.statusFilter === f}
              color={AppColors.primary}
              onClick={() => provider.setStatusFilter(f)}
            />
          ))}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          {SERVICE_TYPES.map((s) => (
            <Chip
              key={s}
              label={s}
              small
              selected={provider.serviceFilter === s}
              color={getServiceTypeColor(s)}
              onClick={() => provider.setServiceFilter(provider.serviceFilter === s ? 'all' : s)}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {provider.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : provider.error ? (
          <ErrorState message={provider.error} />
        ) : provider.deliveries.length === 0 ? (
          <EmptyState icon={ReceiptLongOutlinedIcon} title="No transactions found" subtitle="Delivery requests appear here" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {provider.deliveries.map((delivery) => (
              <OrderCard
                key={delivery.id}
                delivery={delivery}
                onView={() => openDetail(delivery)}
                onCancel={() => setConfirmState({ type: 'cancel', delivery })}
                onDelete={() => setConfirmState({ type: 'delete', delivery })}
              />
            ))}
          </Box>
        )}
      </Box>

      {confirmState && (
        <ConfirmationDialog
          open
          title={confirmState.type === 'cancel' ? 'Cancel Delivery' : 'Delete Record'}
          message={
            confirmState.type === 'cancel'
              ? 'Force-cancel this delivery? The rider and customer will be notified.'
              : 'Permanently delete this delivery record? This cannot be undone.'
          }
          confirmLabel={confirmState.type === 'cancel' ? 'Cancel Delivery' : 'Delete'}
          confirmColor={confirmState.type === 'cancel' ? AppColors.warning : AppColors.error}
          icon={confirmState.type === 'cancel' ? CancelOutlinedIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmState(null)}
          onConfirm={confirmAction}
        />
      )}
    </Box>
  );
}

function Badge({ label, count, color }) {
  return (
    <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: `${color}1A`, border: `1px solid ${color}2E`, display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 11, color, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {label}: {count}
      </Typography>
    </Box>
  );
}

function Chip({ label, selected, color, onClick, small }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 0.6,
        borderRadius: '16px',
        bgcolor: selected ? color : AppColors.background,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: small ? 11 : 12, color: selected ? '#fff' : AppColors.textSecondary, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

function OrderCard({ delivery, onView, onCancel, onDelete }) {
  const shortId = delivery.id.length >= 8 ? delivery.id.slice(0, 8).toUpperCase() : delivery.id.toUpperCase();
  const ServiceIcon = getServiceTypeIcon(delivery.serviceType);
  const serviceColor = getServiceTypeColor(delivery.serviceType);

  return (
    <Box
      onClick={onView}
      sx={{
        p: 1.75,
        borderRadius: '12px',
        bgcolor: AppColors.surface,
        border: `1px solid ${AppColors.divider}`,
        boxShadow: `0 4px 10px ${AppColors.shadow}`,
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ px: 1, py: 0.4, borderRadius: '6px', bgcolor: `${AppColors.primary}14` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: AppColors.primary, fontFamily: 'monospace' }}>
            #{shortId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.9, py: 0.4, borderRadius: '6px', bgcolor: `${serviceColor}1A` }}>
          <ServiceIcon sx={{ fontSize: 11, color: serviceColor }} />
          <Typography sx={{ fontSize: 10, color: serviceColor, fontWeight: 600 }}>{delivery.serviceType}</Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <StatusChip status={delivery.status} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
        <PersonOutlinedIcon sx={{ fontSize: 14, color: AppColors.textSecondary }} />
        <Typography sx={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {delivery.customerName}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: AppColors.primary }}>
          {formatCurrency(delivery.deliveryFee ?? 0)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.6 }}>
        <LocationOnOutlinedIcon sx={{ fontSize: 13, color: AppColors.textSecondary }} />
        <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {delivery.pickupAddress}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
        <DeliveryDiningOutlinedIcon sx={{ fontSize: 13, color: AppColors.textSecondary }} />
        <Typography sx={{ fontSize: 12, color: delivery.riderName ? AppColors.textPrimary : AppColors.textHint, fontStyle: delivery.riderName ? 'normal' : 'italic' }}>
          {delivery.riderName || 'No rider assigned'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <AccessTimeIcon sx={{ fontSize: 11, color: AppColors.textHint }} />
        <Typography sx={{ fontSize: 11, color: AppColors.textHint }}>{getTimeAgo(delivery.createdAt)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }} onClick={(e) => e.stopPropagation()}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={onView}
          sx={{ fontSize: 12 }}
        >
          View
        </Button>
        {delivery.isActive ? (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={onCancel}
            sx={{ fontSize: 12, color: AppColors.warning, borderColor: AppColors.warning }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
            onClick={onDelete}
            sx={{ fontSize: 12, color: AppColors.error, borderColor: AppColors.error }}
          >
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );
}
