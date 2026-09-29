import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { auth } from '../../firebase';
import { SubscriptionState } from '../../models/store';
import { StorageService } from '../../services/storageService';
import { StoreService } from '../../services/storeService';
import ImageUploadField from '../../widgets/imageUpload/ImageUploadField';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function StatusCard({ store }) {
  let icon;
  let color;
  let title;
  let body;

  switch (store.subscriptionState) {
    case SubscriptionState.activeSubscription:
      icon = CheckCircleOutlineIcon;
      color = '#22A55A';
      title = 'Active Paid Subscription';
      body = store.subscriptionEndsAt
        ? `Subscribed until ${dateFormat.format(store.subscriptionEndsAt)} (${store.subscriptionDaysLeft} day${store.subscriptionDaysLeft === 1 ? '' : 's'} remaining).`
        : 'Your subscription is active.';
      break;
    case SubscriptionState.pendingReview:
      icon = HourglassTopIcon;
      color = 'orange';
      title = 'Payment under review';
      body = "We're verifying your payment proof and will update this page once it's confirmed.";
      break;
    case SubscriptionState.rejected:
      icon = ErrorOutlineIcon;
      color = '#BA1A1A';
      title = 'Payment could not be verified';
      body = store.subscriptionRejectionReason ? store.subscriptionRejectionReason : 'Please review your receipt and submit it again below.';
      break;
    case SubscriptionState.activeTrial:
      icon = AccessTimeIcon;
      color = '#1565C0';
      title = 'Active Free Trial';
      body = store.trialEndsAt
        ? `${store.trialDaysLeft} day${store.trialDaysLeft === 1 ? '' : 's'} remaining — trial ends: ${dateFormat.format(store.trialEndsAt)}.`
        : 'Your free trial is starting.';
      break;
    case SubscriptionState.trialEndingSoon:
      icon = WarningAmberRoundedIcon;
      color = '#b45309';
      title = 'Trial Ending Soon';
      body = `Your free trial ends in ${store.trialDaysLeft} day${store.trialDaysLeft === 1 ? '' : 's'}. Subscribe to continue using Store features.`;
      break;
    case SubscriptionState.trialExpired:
      icon = ErrorOutlineIcon;
      color = '#BA1A1A';
      title = 'Trial Expired';
      body = 'Your free trial has ended. Subscribe to continue using Store features.';
      break;
    case SubscriptionState.subscriptionExpired:
      icon = ErrorOutlineIcon;
      color = '#BA1A1A';
      title = 'Subscription Expired';
      body = 'Your subscription has ended. Subscribe below to keep using your store dashboard.';
      break;
    default:
      icon = AccessTimeIcon;
      color = '#1565C0';
      title = 'Free trial starting…';
      body = 'Setting up your free trial — this only takes a moment.';
  }

  const Icon = icon;
  return (
    <Box p={2.5} borderRadius={2} display="flex" alignItems="flex-start" sx={{ bgcolor: `${color}14`, border: `1px solid ${color}4D` }}>
      <Icon sx={{ color, fontSize: 28, mr: 1.75 }} />
      <Box>
        <Typography fontWeight={800} fontSize={16} sx={{ color }}>{title}</Typography>
        <Box height={4} />
        <Typography variant="body2">{body}</Typography>
      </Box>
    </Box>
  );
}

function PlanCard({ plans, selectedPlanId, onSelect, trialDays }) {
  return (
    <Box p={2.5} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper">
      <Typography fontWeight={800} fontSize={15}>Available Plans</Typography>
      <Box height={4} />
      <Typography color="text.secondary" fontSize={12.5}>
        {trialDays != null
          ? `Keeps your store listed and orderable on Vlue Rides. New stores get a ${trialDays}-day free trial.`
          : 'Keeps your store listed and orderable on Vlue Rides.'}
      </Typography>
      <Box height={12} />
      <RadioGroup value={selectedPlanId ?? ''} onChange={(e) => onSelect?.(e.target.value)}>
        {plans.map((plan) => (
          <Box key={plan.id} display="flex" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              value={plan.id}
              disabled={!onSelect}
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={700}>{plan.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{plan.periodDays} day billing period</Typography>
                </Box>
              }
            />
            <Typography fontWeight={800} fontSize={16} color="primary">{plan.priceLabel}</Typography>
          </Box>
        ))}
      </RadioGroup>
    </Box>
  );
}

function PaymentMethodsBox({ paymentMethods }) {
  return (
    <Box p={1.75} borderRadius={1.5} sx={{ bgcolor: 'primary.50' }}>
      <Typography fontWeight={800} fontSize={12.5} color="text.secondary">Send payment to</Typography>
      <Box height={8} />
      {paymentMethods.length === 0 ? (
        <Typography color="text.secondary" fontSize={13}>Contact your admin for payment details.</Typography>
      ) : (
        paymentMethods.map((method) => (
          <Typography key={method.id} fontSize={13.5} mb={0.75}>
            <b>{method.label} — </b>
            {method.accountNumber}
            {method.accountName ? ` (${method.accountName})` : ''}
          </Typography>
        ))
      )}
    </Box>
  );
}

function PaymentForm({ submitting, error, paymentMethods, onImageSelected, onSubmit }) {
  return (
    <Box p={2.5} borderRadius={2} border="1px solid" borderColor="divider" bgcolor="background.paper" component="form" onSubmit={onSubmit}>
      <Typography fontWeight={800} fontSize={15}>Submit Payment Proof</Typography>
      <Box height={4} />
      <Typography color="text.secondary" fontSize={12.5}>
        Pay via GCash / bank transfer, then attach a screenshot or photo of the receipt. An admin will confirm it
        shortly.
      </Typography>
      <Box height={14} />
      <PaymentMethodsBox paymentMethods={paymentMethods} />
      <Box height={16} />
      <ImageUploadField label="Payment Receipt" onImageSelected={onImageSelected} uploading={submitting} />
      {error && (
        <Box mt={2} p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: 'error.light' }}>
          <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main', mr: 1.25 }} />
          <Typography variant="body2" color="error.main">{error}</Typography>
        </Box>
      )}
      <Box height={20} />
      <Button type="submit" variant="contained" disabled={submitting} fullWidth>
        {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit for Review'}
      </Button>
    </Box>
  );
}

// Store-maintenance subscription: a free trial after admin approval, then
// a recurring fee. Reached either as a hard gate (trial ran out / payment
// lapsed / was rejected — AppRouter.jsx redirects here) or voluntarily
// from the dashboard sidebar to check status early. Lives inside the
// dashboard shell like every other dashboard page.
export default function SubscriptionScreen() {
  const uid = auth.currentUser.uid;
  const [store, setStore] = useState(null);
  const [config, setConfig] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofContentType, setProofContentType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => StoreService.streamStore(uid, setStore), [uid]);
  useEffect(() => {
    StoreService.fetchSubscriptionConfig().then(setConfig);
  }, []);

  const plans = config?.plans ?? [];

  useEffect(() => {
    if (plans.length === 0 || selectedPlanId != null || store == null) return;
    // Default to whatever plan the store already has on file (e.g. under
    // review, or previously active) rather than always the first option.
    const onFile = plans.find((p) => p.id === store.planId);
    setSelectedPlanId(onFile ? onFile.id : plans[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, store]);

  if (store == null) {
    return (
      <Box display="flex" justifyContent="center" pt={10}>
        <CircularProgress />
      </Box>
    );
  }

  const needsPayment =
    store.subscriptionState !== SubscriptionState.pendingReview && store.subscriptionState !== SubscriptionState.activeSubscription;

  const submitProof = async (e) => {
    e.preventDefault();
    if (selectedPlanId == null) {
      setError('Please choose a plan first.');
      return;
    }
    if (proofFile == null) {
      setError('Please attach your payment receipt first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const url = await StorageService.uploadSubscriptionProof({ uid, bytes: proofFile, contentType: proofContentType });
      await StoreService.submitPaymentProof({ uid, proofUrl: url, planId: selectedPlanId });
      setProofFile(null);
    } catch (e) {
      setError(`Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" px={3} pt={3.5} pb={3}>
      <Box maxWidth={520} width="100%" display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Subscription</Typography>
          <Box height={4} />
          <Typography variant="body2" color="text.secondary">Store maintenance subscription</Typography>
        </Box>
        <StatusCard store={store} />
        {plans.length > 0 && (
          <PlanCard
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelect={needsPayment ? setSelectedPlanId : null}
            trialDays={config?.trialDays}
          />
        )}
        {needsPayment && (
          <PaymentForm
            submitting={submitting}
            error={error}
            paymentMethods={config?.paymentMethods ?? []}
            onImageSelected={(file, contentType) => {
              setProofFile(file);
              setProofContentType(contentType);
            }}
            onSubmit={submitProof}
          />
        )}
      </Box>
    </Box>
  );
}
