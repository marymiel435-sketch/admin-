import { useState } from 'react';
import { Box, Typography, Button, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { AppColors } from '../theme/colors';
import { useStores } from '../context/StoreContext';
import { planById } from '../models/subscriptionPlanModel';
import { formatDate } from '../utils/appUtils';
import CustomAvatar from './CustomAvatar';

// Mirrors lib/screens/stores/subscription_review_screen.dart's
// SubscriptionReviewCard — public so it can be reused as a one-off dialog
// from the Subscriptions list (Phase 3), not just the aggregate queue below.
export default function SubscriptionReviewCard({ store, config, onDone }) {
  const provider = useStores();
  const [processing, setProcessing] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  const plan = planById(config, store.planId);

  const handleApprove = async () => {
    setApproveOpen(false);
    setProcessing(true);
    const endsAt = new Date(Date.now() + plan.periodDays * 24 * 60 * 60 * 1000);
    const ok = await provider.approveSubscription(store.id, endsAt, {
      storeName: store.name,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
    });
    setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? `${store.name} subscription activated` : `Failed to approve: ${provider.getLastError() ?? 'unknown error'}` });
    if (ok) onDone?.();
    else setProcessing(false);
  };

  const handleReject = async (reason) => {
    setRejectOpen(false);
    setProcessing(true);
    const ok = await provider.rejectSubscription(store.id, reason);
    setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Payment rejected' : `Failed to reject: ${provider.getLastError() ?? 'unknown error'}` });
    if (ok) onDone?.();
    else setProcessing(false);
  };

  return (
    <Box sx={{ borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.warning}4D`, boxShadow: `0 4px 8px ${AppColors.shadow}` }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <CustomAvatar imageUrl={store.logoUrl} name={store.name} size={48} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{store.name}</Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: plan ? AppColors.primary : AppColors.error, mt: 0.25 }}>
            {plan ? `Requested: ${plan.name} · ${plan.priceLabel}` : `Requested plan: ${store.planId ?? 'unknown'}`}
          </Typography>
        </Box>
      </Box>

      {store.paymentProofUrl && (
        <Box sx={{ px: 2, cursor: 'pointer' }} onClick={() => setFullImageOpen(true)}>
          <Box
            sx={{ height: 180, borderRadius: '10px', bgcolor: AppColors.background, backgroundImage: `url(${store.paymentProofUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        </Box>
      )}

      <Box sx={{ height: 12 }} />
      <Divider />
      <Box sx={{ p: 1.5, display: 'flex', gap: 1.25 }}>
        <Button fullWidth variant="outlined" disabled={processing} startIcon={<CloseIcon />} onClick={() => setRejectOpen(true)} sx={{ color: AppColors.error, borderColor: AppColors.error }}>
          Reject
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={processing || !plan}
          startIcon={processing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CheckIcon />}
          onClick={() => setApproveOpen(true)}
          sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}
        >
          {processing ? 'Processing...' : 'Approve'}
        </Button>
      </Box>

      <Dialog open={fullImageOpen} onClose={() => setFullImageOpen(false)} maxWidth="md">
        <Box sx={{ bgcolor: '#000' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, color: '#fff' }}>
            <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>Payment Receipt</Typography>
            <IconButton onClick={() => setFullImageOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box component="img" src={store.paymentProofUrl} alt="Payment receipt" sx={{ display: 'block', maxWidth: '90vw', maxHeight: '80vh', mx: 'auto' }} />
        </Box>
      </Dialog>

      {plan && (
        <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Approve Subscription</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 13.5 }}>
              Activate {plan.name} ({plan.priceLabel}) for {store.name}?
              <br />
              Access will run until {formatDate(new Date(Date.now() + plan.periodDays * 24 * 60 * 60 * 1000))}.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleApprove} sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}>
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <RejectPaymentDialog open={rejectOpen} storeName={store.name} onCancel={() => setRejectOpen(false)} onConfirm={handleReject} />

      {snackbar && (
        <Box sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
          <Box sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: snackbar.severity === 'success' ? AppColors.success : AppColors.error, color: '#fff', fontSize: 13 }}>
            {snackbar.message}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function RejectPaymentDialog({ open, storeName, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onCancel();
  };
  const handleConfirm = () => {
    const value = reason.trim();
    setReason('');
    if (value) onConfirm(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reject Payment</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mb: 1.5 }}>
          Provide a reason — shown to {storeName}&apos;s owner:
        </Typography>
        <TextField
          fullWidth
          autoFocus
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Receipt amount does not match plan price..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" disabled={!reason.trim()} onClick={handleConfirm} sx={{ bgcolor: AppColors.error, '&:hover': { bgcolor: AppColors.error } }}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
