import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoneyIcon from '@mui/icons-material/Money';
import StraightenIcon from '@mui/icons-material/Straighten';
import RouteIcon from '@mui/icons-material/Route';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AppColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import * as firestoreService from '../../services/firestoreService';
import { formatCurrency } from '../../utils/appUtils';

const PREVIEW_DISTANCES = [1, 2, 3, 5, 7, 10, 15];
const SAMPLE_FEES = [40, 60, 100, 150];

// Mirrors lib/screens/settings/settings_screen.dart
export default function SettingsScreen() {
  const auth = useAuth();
  const [baseFare, setBaseFare] = useState('40');
  const [baseDist, setBaseDist] = useState('2');
  const [ratePerKm, setRatePerKm] = useState('8');
  const [riderShare, setRiderShare] = useState('80');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    firestoreService
      .getFareSettings()
      .then((data) => {
        setBaseFare(String(Math.round(data.baseFare ?? 40)));
        setBaseDist(String(Math.round(data.baseDistanceKm ?? 2)));
        setRatePerKm(String(Math.round(data.ratePerKm ?? 8)));
        setRiderShare(String(Math.round(data.riderSharePercent ?? 80)));
      })
      .catch(() => {});
  }, []);

  const baseFareNum = parseFloat(baseFare) || 40;
  const baseDistNum = parseFloat(baseDist) || 2;
  const ratePerKmNum = parseFloat(ratePerKm) || 8;
  const riderShareNum = Math.min(100, Math.max(0, parseFloat(riderShare) || 80));

  const calcFare = (km) => (km <= baseDistNum ? baseFareNum : baseFareNum + (km - baseDistNum) * ratePerKmNum);

  const handleSave = async () => {
    const bf = parseFloat(baseFare);
    const bd = parseFloat(baseDist);
    const rpk = parseFloat(ratePerKm);
    const rs = parseFloat(riderShare);
    if ([bf, bd, rpk, rs].some((v) => Number.isNaN(v))) {
      setSnackbar({ severity: 'error', message: 'Enter valid numbers for all fields' });
      return;
    }
    if (rs < 0 || rs > 100) {
      setSnackbar({ severity: 'error', message: 'Rider Share must be between 0 and 100' });
      return;
    }
    setSaving(true);
    try {
      await firestoreService.saveFareSettings({ baseFare: bf, baseDistanceKm: bd, ratePerKm: rpk, riderSharePercent: rs });
      setSnackbar({ severity: 'success', message: 'Fare settings saved!' });
    } catch (e) {
      setSnackbar({ severity: 'error', message: `Failed to save: ${e?.message ?? e}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2.5, maxWidth: 640, mx: 'auto' }}>
      <Card title="Fare Configuration" icon={LocalShippingOutlinedIcon}>
        <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: AppColors.infoLight }}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, color: AppColors.info }}>Fare Formula</Typography>
          <Typography sx={{ fontSize: 12, color: AppColors.info, mt: 0.5 }}>
            If distance ≤ base km: flat base fare
            <br />
            If distance &gt; base km: base fare + (extra km × rate/km)
          </Typography>
          <Typography sx={{ fontSize: 11, color: AppColors.info, fontStyle: 'italic', mt: 0.5 }}>Example: ₱40 base for ≤2km, +₱8/km beyond</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.75 }}>
          <TextField fullWidth label="Base Fare (₱)" type="number" value={baseFare} onChange={(e) => setBaseFare(e.target.value)} InputProps={{ startAdornment: <MoneyIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />
          <TextField fullWidth label="Base Distance (km)" type="number" value={baseDist} onChange={(e) => setBaseDist(e.target.value)} InputProps={{ startAdornment: <StraightenIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }} />
        </Box>
        <TextField
          fullWidth
          sx={{ mt: 1.5 }}
          label="Rate per KM beyond base (₱)"
          type="number"
          value={ratePerKm}
          onChange={(e) => setRatePerKm(e.target.value)}
          InputProps={{ startAdornment: <RouteIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
        />
      </Card>

      <Box sx={{ height: 16 }} />

      <Card title="Fare Preview" icon={CalculateOutlinedIcon}>
        <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>Sample fares at different distances:</Typography>
        <Box sx={{ mt: 1 }}>
          {PREVIEW_DISTANCES.map((km) => (
            <Box key={km} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RouteIcon sx={{ fontSize: 13, color: AppColors.textSecondary }} />
                <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>{km} km</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: AppColors.primary }}>{formatCurrency(calcFare(km))}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      <Box sx={{ height: 16 }} />

      <Card title="Rider Share Settings" icon={PercentOutlinedIcon}>
        <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: AppColors.infoLight }}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, color: AppColors.info }}>Rider Share per Transaction</Typography>
          <Typography sx={{ fontSize: 12, color: AppColors.info, mt: 0.5 }}>
            Sets what percentage of each delivery fee goes to the rider. The remainder is retained as the platform commission.
          </Typography>
        </Box>
        <TextField
          fullWidth
          sx={{ mt: 1.75 }}
          label="Rider Share (%)"
          type="number"
          value={riderShare}
          onChange={(e) => setRiderShare(e.target.value)}
          InputProps={{ startAdornment: <TwoWheelerOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary, mr: 1 }} /> }}
        />
        <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, mt: 1.75 }}>Sample split at different delivery fees:</Typography>
        <Box sx={{ mt: 1 }}>
          {SAMPLE_FEES.map((fee) => {
            const riderAmount = (fee * riderShareNum) / 100;
            const platformAmount = fee - riderAmount;
            return (
              <Box key={fee} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>Fee {formatCurrency(fee)}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: AppColors.primary }}>
                  Rider {formatCurrency(riderAmount)} · Platform {formatCurrency(platformAmount)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Card>

      <Box sx={{ height: 16 }} />

      <Card title="Admin Account" icon={AdminPanelSettingsOutlinedIcon}>
        <Row icon={PersonOutlinedIcon} label="Name" value={auth.admin?.name ?? 'Admin'} />
        <Row icon={EmailOutlinedIcon} label="Email" value={auth.admin?.email ?? auth.adminEmail ?? '—'} />
        <Row icon={ShieldOutlinedIcon} label="Role" value="Administrator" />
        <Button
          startIcon={<LockResetOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setSnackbar({ severity: 'info', message: 'Password change — check your Firebase console' })}
          sx={{ mt: 1, color: AppColors.primary, borderColor: AppColors.primary }}
          variant="outlined"
        >
          Change Password
        </Button>
      </Card>

      <Button
        fullWidth
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon />}
        disabled={saving}
        onClick={handleSave}
        sx={{ mt: 3, py: 1.75, fontWeight: 700 }}
      >
        {saving ? 'Saving...' : 'SAVE FARE SETTINGS'}
      </Button>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon sx={{ color: AppColors.primary, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.75 }}>
      <Icon sx={{ fontSize: 16, color: AppColors.textSecondary }} />
      <Typography sx={{ width: 80, fontSize: 13, color: AppColors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
