import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import * as firestoreService from '../../services/firestoreService';
import { DEFAULT_SUBSCRIPTION_PLANS_CONFIG } from '../../models/subscriptionPlanModel';
import { EmptyState } from '../../components/EmptyState';
import SubscriptionReviewCard from '../../components/SubscriptionReviewCard';

// Mirrors lib/screens/stores/subscription_review_screen.dart — admin review
// queue for stores that submitted a payment receipt. Approving/rejecting
// here is the entire "payment processing" for this feature.
export default function SubscriptionReviewScreen() {
  const provider = useStores();
  const navigate = useNavigate();
  const [config, setConfig] = useState(DEFAULT_SUBSCRIPTION_PLANS_CONFIG);

  useEffect(() => {
    const unsubscribe = firestoreService.streamSubscriptionPlansConfig(setConfig, () => {});
    return unsubscribe;
  }, []);

  const pending = provider.pendingSubscriptionReviews;

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>Subscription Payment Reviews</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {pending.length === 0 ? (
          <EmptyState icon={CheckCircleOutlineIcon} title="No Pending Payment Reviews" subtitle="All submitted receipts have been reviewed" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxWidth: 720, mx: 'auto' }}>
            {pending.map((store) => (
              <SubscriptionReviewCard key={store.id} store={store} config={config} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
