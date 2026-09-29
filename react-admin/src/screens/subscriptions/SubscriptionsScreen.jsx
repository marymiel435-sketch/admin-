import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import * as firestoreService from '../../services/firestoreService';
import { DEFAULT_SUBSCRIPTION_PLANS_CONFIG, planById } from '../../models/subscriptionPlanModel';
import { SubscriptionState } from '../../models/storeModel';
import { formatCurrency, formatDate } from '../../utils/appUtils';
import SearchBarWidget from '../../components/SearchBarWidget';
import SubscriptionStateChip from '../../components/SubscriptionStateChip';
import SubscriptionReviewCard from '../../components/SubscriptionReviewCard';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState } from '../../components/EmptyState';

const FILTERS = ['all', 'Trial', 'Pending Review', 'Active', 'Expired', 'Rejected', 'Not Started'];

function matchesFilter(state, filter) {
  switch (filter) {
    case 'all':
      return true;
    case 'Trial':
      return state === SubscriptionState.activeTrial || state === SubscriptionState.trialEndingSoon;
    case 'Pending Review':
      return state === SubscriptionState.pendingReview;
    case 'Active':
      return state === SubscriptionState.activeSubscription;
    case 'Expired':
      return state === SubscriptionState.trialExpired || state === SubscriptionState.subscriptionExpired;
    case 'Rejected':
      return state === SubscriptionState.rejected;
    case 'Not Started':
      return state === SubscriptionState.notStarted;
    default:
      return true;
  }
}

function daysLeftLabel(end) {
  const days = Math.floor((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  return `${days} day${days === 1 ? '' : 's'}`;
}

// Mirrors lib/screens/subscriptions/subscriptions_screen.dart
export default function SubscriptionsScreen() {
  const provider = useStores();
  const navigate = useNavigate();
  const [config, setConfig] = useState(DEFAULT_SUBSCRIPTION_PLANS_CONFIG);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [backfilling, setBackfilling] = useState(false);
  const [infoStore, setInfoStore] = useState(null);
  const [reviewStore, setReviewStore] = useState(null);

  useEffect(() => {
    provider.startListening();
    const unsub1 = firestoreService.streamSubscriptionPlansConfig(setConfig, () => {});
    const unsub2 = firestoreService.streamSubscriptionPayments(setPayments, () => {});
    return () => {
      unsub1();
      unsub2();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidStoreIds = new Set(payments.map((p) => p.storeId));
  const all = provider.allStores;
  const unlogged = all.filter((s) => s.subscriptionStatus === 'active' && !paidStoreIds.has(s.id));

  let visible = all.filter((s) => matchesFilter(s.subscriptionState, filter));
  if (search) {
    const q = search.toLowerCase();
    visible = visible.filter((s) => s.name.toLowerCase().includes(q));
  }

  const active = all.filter((s) => s.subscriptionState === SubscriptionState.activeSubscription).length;
  const inTrial = all.filter((s) => s.subscriptionState === SubscriptionState.activeTrial || s.subscriptionState === SubscriptionState.trialEndingSoon).length;
  const pending = all.filter((s) => s.subscriptionState === SubscriptionState.pendingReview).length;

  const handleBackfill = async () => {
    setBackfilling(true);
    let count = 0;
    try {
      for (const store of unlogged) {
        const plan = planById(config, store.planId);
        if (!plan) continue;
        await firestoreService.logSubscriptionPayment({
          storeId: store.id,
          storeName: store.name,
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          approvedAt: store.subscriptionStartedAt ?? store.updatedAt,
        });
        count++;
      }
    } finally {
      setBackfilling(false);
    }
  };

  const resolvable = unlogged.filter((s) => planById(config, s.planId) != null).length;
  const unresolvable = unlogged.length - resolvable;

  return (
    <Box sx={{ p: '20px 24px 24px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 700 }}>Store Subscriptions</Typography>
        <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => navigate('/subscriptions/settings')} sx={{ color: AppColors.primary, borderColor: AppColors.primary }}>
          Trial &amp; Plan Settings
        </Button>
      </Box>

      {unlogged.length > 0 && (
        <Box sx={{ mt: 2, p: 1.75, borderRadius: '12px', bgcolor: AppColors.warningLight, border: `1px solid ${AppColors.warning}4D`, display: 'flex', gap: 1.25 }}>
          <InfoOutlinedIcon sx={{ color: AppColors.warning, fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: AppColors.warning }}>
              {unlogged.length} active subscription{unlogged.length === 1 ? '' : 's'} aren&apos;t reflected in Total Revenue
            </Typography>
            <Typography sx={{ fontSize: 12, mt: 0.5 }}>
              These were marked active before this payment ledger existed.{' '}
              {unresolvable > 0 && `${unresolvable} of them use a plan id no longer in Settings and must be fixed manually. `}
              Backfilling logs a payment record dated to when each subscription started.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={backfilling || resolvable === 0}
              startIcon={backfilling ? <CircularProgress size={14} /> : <HistoryEduOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleBackfill}
              sx={{ mt: 1.25, color: AppColors.warning, borderColor: AppColors.warning }}
            >
              {backfilling ? 'Backfilling...' : `Backfill ${resolvable} Missing Record${resolvable === 1 ? '' : 's'}`}
            </Button>
          </Box>
        </Box>
      )}

      <Grid container spacing={1.75} sx={{ mt: 0.5 }}>
        <StatTile title="Active Subscribers" value={String(active)} icon={VerifiedOutlinedIcon} color={AppColors.success} />
        <StatTile title="In Trial" value={String(inTrial)} icon={TimelapseIcon} color={AppColors.info} />
        <StatTile title="Pending Review" value={String(pending)} icon={ReceiptLongOutlinedIcon} color={AppColors.warning} onClick={() => navigate('/stores/subscription-reviews')} />
        <StatTile title="Total Revenue" value={formatCurrency(totalRevenue)} icon={PaymentsOutlinedIcon} color={AppColors.primary} />
      </Grid>

      {payments.length > 0 && (
        <Box sx={{ mt: 2.25, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '14px 16px 8px' }}>
            <HistoryIcon sx={{ color: AppColors.primary, fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Payment</Typography>
          </Box>
          <Box sx={{ borderTop: `1px solid ${AppColors.divider}`, px: 2, py: 1.25, display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography sx={{ flex: 2, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{payments[0].storeName}</Typography>
            <Typography sx={{ flex: 1, fontSize: 12.5, color: AppColors.textSecondary }}>{payments[0].planName}</Typography>
            <Typography sx={{ flex: 1, fontSize: 12, color: AppColors.textSecondary }}>{formatDate(payments[0].approvedAt)}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: AppColors.success }}>{formatCurrency(payments[0].amount)}</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 2.25 }}>
        <SearchBarWidget hint="Search store name..." value={search} onChange={setSearch} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {FILTERS.map((f) => (
            <Box
              key={f}
              onClick={() => setFilter(f)}
              sx={{ px: 1.5, py: 1.25, borderRadius: '10px', cursor: 'pointer', bgcolor: filter === f ? AppColors.primary : AppColors.surface, border: `1px solid ${filter === f ? AppColors.primary : AppColors.border}` }}
            >
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: filter === f ? '#fff' : AppColors.textPrimary }}>{f === 'all' ? 'All' : f}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {provider.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : visible.length === 0 ? (
          <EmptyState icon={WorkspacePremiumOutlinedIcon} title="No stores match this filter" subtitle="Try a different filter or search term" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {visible.map((store) => (
              <StoreSubscriptionTile
                key={store.id}
                store={store}
                config={config}
                payments={payments}
                onInfo={() => setInfoStore(store)}
                onReview={() => setReviewStore(store)}
              />
            ))}
          </Box>
        )}
      </Box>

      {infoStore && <InfoDialog store={infoStore} config={config} payments={payments} onClose={() => setInfoStore(null)} />}

      {reviewStore && (
        <Dialog open onClose={() => setReviewStore(null)} maxWidth="xs" fullWidth>
          <Box sx={{ p: 0.5 }}>
            <SubscriptionReviewCard store={reviewStore} config={config} onDone={() => setReviewStore(null)} />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

function StatTile({ title, value, icon: Icon, color, onClick }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Box
        onClick={onClick}
        sx={{ p: 2, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 12px ${AppColors.shadow}`, display: 'flex', alignItems: 'center', gap: 1.5, cursor: onClick ? 'pointer' : 'default' }}
      >
        <Box sx={{ p: 1.25, borderRadius: '50%', bgcolor: `${color}1A`, display: 'flex' }}>
          <Icon sx={{ color, fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</Typography>
          <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>{title}</Typography>
        </Box>
        {onClick && <ArrowForwardIosIcon sx={{ fontSize: 12, color: AppColors.textSecondary }} />}
      </Box>
    </Grid>
  );
}

function StoreSubscriptionTile({ store, config, payments, onInfo, onReview }) {
  const state = store.subscriptionState;
  let dateLabel = null;
  if (state === SubscriptionState.activeSubscription || state === SubscriptionState.subscriptionExpired) {
    if (store.subscriptionEndsAt) dateLabel = `${state === SubscriptionState.subscriptionExpired ? 'Expired' : 'Renews'} ${formatDate(store.subscriptionEndsAt)}`;
  } else if (store.trialEndsAt) {
    dateLabel = `${state === SubscriptionState.trialExpired ? 'Expired' : 'Trial ends'} ${formatDate(store.trialEndsAt)}`;
  }

  return (
    <Box sx={{ borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box onClick={onInfo} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
        <CustomAvatar imageUrl={store.logoUrl} name={store.name} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{store.name}</Typography>
          {(store.planId || dateLabel) && (
            <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>
              {[store.planId, dateLabel].filter(Boolean).join(' · ')}
            </Typography>
          )}
        </Box>
        <SubscriptionStateChip state={state} />
      </Box>
      {state === SubscriptionState.pendingReview && (
        <Box sx={{ borderTop: `1px solid ${AppColors.divider}`, p: '8px 12px 10px' }}>
          <Button fullWidth variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} onClick={onReview} sx={{ color: AppColors.warning, borderColor: AppColors.warning }}>
            Review Payment
          </Button>
        </Box>
      )}
    </Box>
  );
}

function InfoDialog({ store, config, payments, onClose }) {
  const state = store.subscriptionState;
  const plan = planById(config, store.planId);
  const payment = payments.find((p) => p.storeId === store.id) ?? null;

  const rows = [];
  const row = (label, value, color) => rows.push([label, value, color]);

  switch (state) {
    case SubscriptionState.notStarted:
      row('Status', 'Trial not started yet');
      break;
    case SubscriptionState.activeTrial:
    case SubscriptionState.trialEndingSoon:
      row('Status', 'Free trial', state === SubscriptionState.trialEndingSoon ? AppColors.warning : null);
      if (store.trialEndsAt) {
        row('Trial ends', formatDate(store.trialEndsAt));
        row('Days left', daysLeftLabel(store.trialEndsAt));
      }
      break;
    case SubscriptionState.trialExpired:
      row('Status', 'Trial expired', AppColors.error);
      if (store.trialEndsAt) row('Expired on', formatDate(store.trialEndsAt));
      break;
    case SubscriptionState.pendingReview:
      row('Status', 'Payment pending review', AppColors.warning);
      row('Requested plan', plan ? `${plan.name} · ${plan.priceLabel}` : store.planId ?? 'Unknown');
      if (plan) row('Amount to Confirm', formatCurrency(plan.price), AppColors.warning);
      break;
    case SubscriptionState.rejected:
      row('Status', 'Payment rejected', AppColors.error);
      break;
    case SubscriptionState.activeSubscription:
      row('Status', 'Subscribed', AppColors.success);
      row('Plan', plan?.name ?? store.planId ?? '—');
      row('Amount Paid', payment ? formatCurrency(payment.amount) : plan ? `${formatCurrency(plan.price)} (est.)` : '—', AppColors.success);
      if (store.subscriptionEndsAt) {
        row('Ends', formatDate(store.subscriptionEndsAt));
        row('Days left', daysLeftLabel(store.subscriptionEndsAt));
      }
      break;
    case SubscriptionState.subscriptionExpired:
      row('Status', 'Subscription expired', AppColors.error);
      row('Plan', plan?.name ?? store.planId ?? '—');
      row('Amount Paid', payment ? formatCurrency(payment.amount) : plan ? `${formatCurrency(plan.price)} (est.)` : '—');
      if (store.subscriptionEndsAt) row('Expired on', formatDate(store.subscriptionEndsAt));
      break;
    default:
      break;
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <CustomAvatar imageUrl={store.logoUrl} name={store.name} size={32} />
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</Box>
      </DialogTitle>
      <DialogContent>
        {rows.map(([label, value, color]) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
            <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>{label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: color ?? AppColors.textPrimary, textAlign: 'right' }}>{value}</Typography>
          </Box>
        ))}
        {state === SubscriptionState.rejected && store.subscriptionRejectionReason && (
          <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, mt: 1 }}>{store.subscriptionRejectionReason}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
