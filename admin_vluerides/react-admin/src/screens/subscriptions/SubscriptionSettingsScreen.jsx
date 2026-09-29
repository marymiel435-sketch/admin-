import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AppColors } from '../../theme/colors';
import * as firestoreService from '../../services/firestoreService';

// Renders a numeric price as the display label shown to store owners
// (e.g. 199 -> "₱199"). Mirrors _priceLabelFor in subscription_settings_screen.dart.
function priceLabelFor(price) {
  return `₱${Math.round(price).toLocaleString('en-US')}`;
}

let nextTempId = 0;

// Mirrors lib/screens/subscriptions/subscription_settings_screen.dart
export default function SubscriptionSettingsScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trialDays, setTrialDays] = useState('30');
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    firestoreService
      .getSubscriptionPlansConfig()
      .then((config) => {
        setTrialDays(String(config.trialDays));
        setPlans(config.plans.map((p) => ({ ...p, priceValue: String(Math.round(p.price)) })));
        setPaymentMethods(config.paymentMethods);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updatePlan = (id, patch) => setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const updateMethod = (id, patch) => setPaymentMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const addMethod = () => setPaymentMethods((prev) => [...prev, { id: `new-${nextTempId++}`, label: '', accountNumber: '', accountName: '' }]);
  const removeMethod = (id) => setPaymentMethods((prev) => prev.filter((m) => m.id !== id));

  const handleSave = async () => {
    const trialDaysNum = parseInt(trialDays, 10);
    if (!trialDaysNum || trialDaysNum <= 0) {
      setSnackbar({ severity: 'error', message: 'Enter a valid trial length' });
      return;
    }

    const finalPlans = [];
    for (const p of plans) {
      const periodDays = parseInt(p.periodDays, 10);
      const priceValue = parseFloat(p.priceValue);
      if (!p.name.trim() || !periodDays || periodDays <= 0 || Number.isNaN(priceValue) || priceValue < 0) {
        setSnackbar({ severity: 'error', message: `Fix the ${p.id} plan fields` });
        return;
      }
      finalPlans.push({ id: p.id, name: p.name.trim(), priceLabel: priceLabelFor(priceValue), periodDays, price: priceValue });
    }

    const finalMethods = [];
    for (const m of paymentMethods) {
      const label = m.label.trim();
      const accountNumber = m.accountNumber.trim();
      if (!label || !accountNumber) {
        setSnackbar({ severity: 'error', message: 'Enter a method name and account number for every payment method' });
        return;
      }
      finalMethods.push({ id: m.id, label, accountNumber, accountName: (m.accountName ?? '').trim() });
    }

    setSaving(true);
    try {
      await firestoreService.saveSubscriptionPlansConfig({ trialDays: trialDaysNum, plans: finalPlans, paymentMethods: finalMethods });
      setSnackbar({ severity: 'success', message: 'Subscription settings saved!' });
    } catch (e) {
      setSnackbar({ severity: 'error', message: `Failed to save: ${e?.message ?? e}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>Trial &amp; Plan Settings</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
          <CircularProgress sx={{ color: AppColors.primary }} />
        </Box>
      ) : (
        <Box sx={{ p: 2.5, maxWidth: 640, mx: 'auto' }}>
          <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
            <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: AppColors.infoLight }}>
              <Typography sx={{ fontSize: 12, color: AppColors.info }}>
                Changing the trial length only affects trials that start AFTER you save — stores already mid-trial keep the end date they were already granted.
              </Typography>
            </Box>

            <TextField
              fullWidth
              sx={{ mt: 2 }}
              label="Free Trial Length (days)"
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              InputProps={{ startAdornment: <TimelapseOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
            />

            <Typography sx={{ fontWeight: 700, fontSize: 13, mt: 2.5 }}>Paid Plans</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1 }}>
              {plans.map((p) => (
                <Box key={p.id} sx={{ p: 1.5, borderRadius: '10px', bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}` }}>
                  <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, fontWeight: 600 }}>{p.id}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
                    <TextField fullWidth size="small" label="Name" value={p.name} onChange={(e) => updatePlan(p.id, { name: e.target.value })} sx={{ flex: 2 }} />
                    <TextField fullWidth size="small" type="number" label="Days" value={p.periodDays} onChange={(e) => updatePlan(p.id, { periodDays: e.target.value })} />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    sx={{ mt: 1.25 }}
                    type="number"
                    label="Price (₱)"
                    value={p.priceValue}
                    onChange={(e) => updatePlan(p.id, { priceValue: e.target.value })}
                    helperText={`Shown to store owners as "${priceLabelFor(parseFloat(p.priceValue) || 0)}"`}
                    InputProps={{ startAdornment: <PaymentsOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
                  />
                </Box>
              ))}
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: 13, mt: 2.5 }}>Payment Methods (shown to store owners)</Typography>
            <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, mt: 0.5 }}>
              These accounts are shown to store owners when they pay for a subscription, so they know where to send money before uploading their receipt.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1.25 }}>
              {paymentMethods.map((m) => (
                <Box key={m.id} sx={{ p: 1.5, borderRadius: '10px', bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}` }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField fullWidth size="small" label="Method (e.g. GCash, PayMaya)" value={m.label} onChange={(e) => updateMethod(m.id, { label: e.target.value })} />
                    <IconButton onClick={() => removeMethod(m.id)} title="Remove">
                      <DeleteOutlineIcon sx={{ color: AppColors.error }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.25, mt: 1.25 }}>
                    <TextField fullWidth size="small" label="Account / Mobile Number" value={m.accountNumber} onChange={(e) => updateMethod(m.id, { accountNumber: e.target.value })} />
                    <TextField fullWidth size="small" label="Account Name (optional)" value={m.accountName} onChange={(e) => updateMethod(m.id, { accountName: e.target.value })} />
                  </Box>
                </Box>
              ))}
            </Box>
            <Button startIcon={<AddIcon />} onClick={addMethod} sx={{ mt: 1.25, color: AppColors.primary, borderColor: AppColors.primary }} variant="outlined">
              Add Payment Method
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon />}
              disabled={saving}
              onClick={handleSave}
              sx={{ mt: 2.5, py: 1.5 }}
            >
              {saving ? 'Saving...' : 'Save Subscription Settings'}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
