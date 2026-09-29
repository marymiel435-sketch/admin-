import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import RouteIcon from '@mui/icons-material/Route';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import CircleIcon from '@mui/icons-material/Circle';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { AppColors } from '../../theme/colors';
import { useOrders } from '../../context/OrderContext';
import { COMPLETED_STATUSES } from '../../models/deliveryRequestModel';
import {
  formatCurrency,
  formatDateTime,
  formatDistance,
  formatDuration,
  getServiceTypeIcon,
  getStatusLabel,
} from '../../utils/appUtils';
import StatusChip from '../../components/StatusChip';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const STATUS_FLOW = [
  'searching_rider', 'rider_assigned', 'accepted', 'arriving',
  'picked_up', 'in_transit', 'near_destination', 'delivered', 'completed',
];

// Mirrors lib/screens/orders/order_detail_screen.dart
export default function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useOrders();
  const delivery = provider.allDeliveries.find((d) => d.id === id);
  const [confirmType, setConfirmType] = useState(null);

  if (!delivery) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: AppColors.textSecondary }}>Delivery not found.</Typography>
      </Box>
    );
  }

  const shortId = delivery.id.length >= 8 ? delivery.id.slice(0, 8).toUpperCase() : delivery.id.toUpperCase();
  const ServiceIcon = getServiceTypeIcon(delivery.serviceType);

  const confirmAction = async () => {
    const type = confirmType;
    setConfirmType(null);
    if (type === 'cancel') await provider.cancelDelivery(delivery.id);
    else await provider.deleteDelivery(delivery.id);
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>#{shortId}</Typography>
        <Box sx={{ flex: 1 }} />
        <StatusChip status={delivery.status} fontSize={12} />
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.75, maxWidth: 720, mx: 'auto' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${AppColors.gradientPrimary[0]}, ${AppColors.gradientPrimary[1]})`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex' }}>
            <ServiceIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{delivery.serviceType}</Typography>
            <Typography sx={{ color: '#fff', fontSize: 12 }}>{formatDateTime(delivery.createdAt)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{formatCurrency(delivery.grandTotal)}</Typography>
            {delivery.paymentMethod && (
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{delivery.paymentMethod}</Typography>
            )}
          </Box>
        </Box>

        {/* Parties */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <InfoCard icon={PersonOutlinedIcon} title="Customer" content={delivery.customerName} sub={delivery.customerPhone} />
          <InfoCard
            icon={delivery.riderName ? DeliveryDiningIcon : DeliveryDiningOutlinedIcon}
            title="Rider"
            content={delivery.riderName || 'Not assigned'}
            sub={delivery.riderName ? 'Assigned' : 'Searching...'}
            color={delivery.riderName ? AppColors.success : AppColors.warning}
          />
        </Box>

        {/* Delivery details */}
        <Card title="Delivery Details">
          <LocationRow icon={LocationOnIcon} label="Pickup" address={delivery.pickupAddress} color={AppColors.warning} />
          {delivery.deliveryAddress && (
            <>
              <Box sx={{ height: 8 }} />
              <LocationRow icon={FlagIcon} label="Drop-off" address={delivery.deliveryAddress} color={AppColors.error} />
            </>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            {delivery.distanceKm != null && <MetricChip icon={RouteIcon} label="Distance" value={formatDistance(delivery.distanceKm)} />}
            <MetricChip icon={LocalShippingOutlinedIcon} label="Delivery Fee" value={formatCurrency(delivery.deliveryFee ?? 0)} />
            {delivery.durationMinutes != null && (
              <MetricChip icon={TimerOutlinedIcon} label="Est. Time" value={formatDuration(delivery.durationMinutes)} />
            )}
          </Box>
          {delivery.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                <NoteOutlinedIcon sx={{ fontSize: 14, color: AppColors.textSecondary, mt: 0.25 }} />
                <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>{delivery.notes}</Typography>
              </Box>
            </>
          )}
          {delivery.itemName && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>Item Details</Typography>
              <InfoRow label="Item" value={delivery.itemName} />
              {delivery.itemCategory && <InfoRow label="Category" value={delivery.itemCategory} />}
              {delivery.itemSize && <InfoRow label="Size" value={delivery.itemSize} />}
              {delivery.itemWeight != null && <InfoRow label="Weight" value={`${delivery.itemWeight.toFixed(1)} kg`} />}
            </>
          )}
        </Card>

        {/* Fare breakdown */}
        <Card title="Fare Breakdown">
          {delivery.itemsTotalPrice != null && <PayRow label="Items Subtotal" amount={formatCurrency(delivery.itemsTotalPrice)} />}
          <PayRow label="Delivery Fee" amount={formatCurrency(delivery.deliveryFee ?? 0)} />
          <Divider sx={{ my: 1.5 }} />
          <PayRow label="Grand Total" amount={formatCurrency(delivery.grandTotal)} bold />
          {delivery.paymentMethod && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1.25, px: 1.25, py: 0.6, borderRadius: 1, bgcolor: AppColors.successLight }}>
              <PaymentIcon sx={{ fontSize: 14, color: AppColors.success }} />
              <Typography sx={{ color: AppColors.success, fontSize: 12, fontWeight: 600 }}>{delivery.paymentMethod}</Typography>
            </Box>
          )}
        </Card>

        {/* Timeline */}
        <Card title={delivery.isCancelled ? null : 'Delivery Status'}>
          {delivery.isCancelled ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CancelIcon sx={{ color: AppColors.error, fontSize: 28 }} />
              <Typography sx={{ color: AppColors.error, fontWeight: 700, fontSize: 15 }}>Delivery Cancelled</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {STATUS_FLOW.map((status, index) => {
                const currentIndex = STATUS_FLOW.indexOf(delivery.status);
                const isCompletedOverall = COMPLETED_STATUSES.includes(delivery.status);
                const isDone = currentIndex > index || isCompletedOverall;
                const isCurrent = currentIndex === index && !isCompletedOverall;
                return (
                  <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isDone ? AppColors.success : isCurrent ? AppColors.primary : AppColors.divider,
                        flexShrink: 0,
                      }}
                    >
                      {isDone ? <CheckIcon sx={{ color: '#fff', fontSize: 14 }} /> : <CircleIcon sx={{ color: '#fff', fontSize: 8 }} />}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: isCurrent ? 700 : 400,
                        color: isCurrent ? AppColors.primary : isDone ? AppColors.success : AppColors.textHint,
                      }}
                    >
                      {getStatusLabel(status)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>

        {delivery.customerRating != null && (
          <Card title="Customer Rating">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ display: 'flex' }}>
                {[0, 1, 2, 3, 4].map((i) =>
                  i < delivery.customerRating ? (
                    <StarIcon key={i} sx={{ color: AppColors.warning, fontSize: 22 }} />
                  ) : (
                    <StarBorderIcon key={i} sx={{ color: AppColors.warning, fontSize: 22 }} />
                  ),
                )}
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{delivery.customerRating}/5</Typography>
            </Box>
            {delivery.customerFeedback && (
              <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, fontStyle: 'italic', mt: 1 }}>
                &quot;{delivery.customerFeedback}&quot;
              </Typography>
            )}
          </Card>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {delivery.isActive && (
            <Button
              variant="outlined"
              startIcon={<CancelOutlinedIcon />}
              onClick={() => setConfirmType('cancel')}
              sx={{ color: AppColors.warning, borderColor: AppColors.warning, py: 1.5 }}
            >
              Force Cancel Delivery
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmType('delete')}
            sx={{ color: AppColors.error, borderColor: AppColors.error, py: 1.5 }}
          >
            Delete Record
          </Button>
        </Box>
      </Box>

      {confirmType && (
        <ConfirmationDialog
          open
          title={confirmType === 'cancel' ? 'Force Cancel' : 'Delete Record'}
          message={
            confirmType === 'cancel'
              ? 'Force cancel this active delivery? Rider and customer will be notified.'
              : 'Permanently delete this delivery record? This cannot be undone.'
          }
          confirmLabel={confirmType === 'cancel' ? 'Cancel Delivery' : 'Delete'}
          confirmColor={confirmType === 'cancel' ? AppColors.warning : AppColors.error}
          icon={confirmType === 'cancel' ? CancelOutlinedIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmType(null)}
          onConfirm={confirmAction}
        />
      )}
    </Box>
  );
}

function Card({ title, children }) {
  return (
    <Box sx={{ p: 2, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      {title && <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>{title}</Typography>}
      {children}
    </Box>
  );
}

function InfoCard({ icon: Icon, title, content, sub, color }) {
  return (
    <Box sx={{ flex: 1, p: 1.5, borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon sx={{ fontSize: 14, color: color || AppColors.textSecondary }} />
        <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>{title}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: 13, mt: 0.75 }}>{content}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: color || AppColors.textSecondary }}>{sub}</Typography>}
    </Box>
  );
}

function LocationRow({ icon: Icon, label, address, color }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon sx={{ fontSize: 16, color }} />
      <Box>
        <Typography sx={{ fontSize: 10, color, fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12 }}>{address}</Typography>
      </Box>
    </Box>
  );
}

function MetricChip({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Icon sx={{ fontSize: 16, color: AppColors.textSecondary }} />
      <Typography sx={{ fontWeight: 700, fontSize: 12, mt: 0.25 }}>{value}</Typography>
      <Typography sx={{ fontSize: 10, color: AppColors.textSecondary }}>{label}</Typography>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', py: 0.4 }}>
      <Typography sx={{ width: 80, fontSize: 12, color: AppColors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

function PayRow({ label, amount, bold }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography sx={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: bold ? AppColors.textPrimary : AppColors.textSecondary }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: bold ? AppColors.primary : AppColors.textPrimary }}>
        {amount}
      </Typography>
    </Box>
  );
}
