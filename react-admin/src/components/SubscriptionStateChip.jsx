import { Box, Typography } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { AppColors } from '../theme/colors';
import { SubscriptionState, SUBSCRIPTION_STATE_LABELS } from '../models/storeModel';

// Mirrors lib/core/utils/subscription_ui.dart's SubscriptionStateUi + SubscriptionStateChip
const STATE_COLOR = {
  [SubscriptionState.notStarted]: AppColors.textSecondary,
  [SubscriptionState.activeTrial]: AppColors.info,
  [SubscriptionState.trialEndingSoon]: AppColors.warning,
  [SubscriptionState.trialExpired]: AppColors.error,
  [SubscriptionState.pendingReview]: AppColors.warning,
  [SubscriptionState.rejected]: AppColors.error,
  [SubscriptionState.activeSubscription]: AppColors.success,
  [SubscriptionState.subscriptionExpired]: AppColors.error,
};

const STATE_ICON = {
  [SubscriptionState.notStarted]: HourglassEmptyIcon,
  [SubscriptionState.activeTrial]: TimelapseIcon,
  [SubscriptionState.trialEndingSoon]: TimerOutlinedIcon,
  [SubscriptionState.trialExpired]: TimerOffOutlinedIcon,
  [SubscriptionState.pendingReview]: ReceiptLongOutlinedIcon,
  [SubscriptionState.rejected]: CancelOutlinedIcon,
  [SubscriptionState.activeSubscription]: VerifiedOutlinedIcon,
  [SubscriptionState.subscriptionExpired]: EventBusyOutlinedIcon,
};

export default function SubscriptionStateChip({ state, fontSize = 11 }) {
  const color = STATE_COLOR[state];
  const Icon = STATE_ICON[state];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.25,
        py: 0.4,
        borderRadius: '20px',
        bgcolor: `${color}1A`,
        border: `1px solid ${color}4D`,
        width: 'fit-content',
      }}
    >
      <Icon sx={{ fontSize: fontSize + 2, color }} />
      <Typography sx={{ color, fontSize, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {SUBSCRIPTION_STATE_LABELS[state]}
      </Typography>
    </Box>
  );
}
