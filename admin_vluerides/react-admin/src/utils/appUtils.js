import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import { AppColors } from '../theme/colors';

// Mirrors lib/core/utils/app_utils.dart

export function asDouble(value) {
  if (value === null || value === undefined) return 0.0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0.0 : parsed;
  }
  return 0.0;
}

export function asInt(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Math.trunc(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

export function formatDate(date) {
  return dateFmt.format(date);
}

export function formatDateTime(date) {
  return `${dateFmt.format(date)} ${timeFmt.format(date)}`;
}

export function formatTime(date) {
  return timeFmt.format(date);
}

export function formatCurrency(amount) {
  const value = (amount ?? 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₱${value}`;
}

export function formatNumber(number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(number);
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getStatusColor(status) {
  switch (status) {
    case 'searching_rider':
    case 'rider_assigned':
      return AppColors.warning;
    case 'accepted':
    case 'arriving':
    case 'picked_up':
    case 'in_transit':
    case 'near_destination':
      return AppColors.primary;
    case 'delivered':
    case 'completed':
    case 'Approved':
    case 'Active':
      return AppColors.success;
    case 'cancelled':
    case 'Suspended':
    case 'Rejected':
      return AppColors.error;
    case 'Pending Approval':
    case 'Pending':
      return AppColors.warning;
    case 'Documents Requested':
      return AppColors.info;
    default:
      return AppColors.textSecondary;
  }
}

export function getStatusBgColor(status) {
  switch (status) {
    case 'searching_rider':
    case 'rider_assigned':
    case 'Pending Approval':
    case 'Pending':
      return AppColors.warningLight;
    case 'accepted':
    case 'arriving':
    case 'picked_up':
    case 'in_transit':
    case 'near_destination':
      return AppColors.infoLight;
    case 'delivered':
    case 'completed':
    case 'Approved':
    case 'Active':
      return AppColors.successLight;
    case 'cancelled':
    case 'Suspended':
    case 'Rejected':
      return AppColors.errorLight;
    case 'Documents Requested':
      return AppColors.infoLight;
    default:
      return AppColors.background;
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'searching_rider':
      return 'Searching Rider';
    case 'rider_assigned':
      return 'Rider Assigned';
    case 'picked_up':
      return 'Picked Up';
    case 'in_transit':
      return 'In Transit';
    case 'near_destination':
      return 'Near Destination';
    case 'Pending Approval':
      return 'Pending Approval';
    case 'Documents Requested':
      return 'Documents Requested';
    default: {
      const trimmed = (status ?? '').trim();
      if (!trimmed) return '';
      return trimmed[0].toUpperCase() + trimmed.slice(1);
    }
  }
}

export function getTimeAgo(dateTime) {
  const diffMs = Date.now() - dateTime.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateTime);
}

export function getServiceTypeColor(type) {
  switch (type) {
    case 'Pickup':
      return '#7B1FA2';
    case 'Pabili':
      return AppColors.warning;
    case 'Food Delivery':
      return '#E65100';
    case 'Pay Bills':
      return AppColors.primary;
    default:
      return AppColors.textSecondary;
  }
}

export function getServiceTypeIcon(type) {
  switch (type) {
    case 'Pickup':
      return LocalShippingOutlinedIcon;
    case 'Pabili':
      return ShoppingBagOutlinedIcon;
    case 'Food Delivery':
      return RestaurantOutlinedIcon;
    case 'Pay Bills':
      return ReceiptOutlinedIcon;
    default:
      return DeliveryDiningOutlinedIcon;
  }
}
