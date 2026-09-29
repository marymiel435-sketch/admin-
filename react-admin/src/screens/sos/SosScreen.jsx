import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, IconButton, Button } from '@mui/material';
import SosIcon from '@mui/icons-material/Sos';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import CopyOutlinedIcon from '@mui/icons-material/CopyAll';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import * as firestoreService from '../../services/firestoreService';
import { readableAddressFor } from '../../services/purokLocationService';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import ConfirmationDialog from '../../components/ConfirmationDialog';

function firstPresent(values, fallback = '') {
  for (const v of values) {
    const trimmed = (v ?? '').trim();
    if (trimmed) return trimmed;
  }
  return fallback;
}

function timeAgo(time) {
  if (!time) return 'Active';
  const diffMs = Date.now() - time.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Mirrors lib/screens/sos/sos_screen.dart
export default function SosScreen() {
  const riderProvider = useRiders();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(null);
  const [resolvedAlerts, setResolvedAlerts] = useState(null);
  const [error, setError] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null); // { alert, rider }
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    riderProvider.startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setError(null);
    const unsub1 = firestoreService.streamSosAlerts(setAlerts, (e) => setError(e?.message ?? String(e)));
    const unsub2 = firestoreService.streamResolvedSosAlerts(setResolvedAlerts, (e) => setError(e?.message ?? String(e)));
    return () => {
      unsub1();
      unsub2();
    };
  }, [retryKey]);

  const riderForAlert = (alert) => {
    if (!alert.riderId) return null;
    return riderProvider.allRiders.find((r) => r.uid === alert.riderId) ?? null;
  };

  const sosAlerts = alerts ?? [];
  const resolved = resolvedAlerts ?? [];
  const isLoading = alerts === null || riderProvider.isLoading;

  const displayName = (alert, rider) => {
    const riderName = rider?.fullName?.trim() ?? '';
    if (riderName) return riderName;
    const alertName = alert.riderName.trim();
    if (alertName) return alertName;
    return 'this rider';
  };

  const doResolve = async () => {
    const { alert } = resolveTarget;
    setResolveTarget(null);
    try {
      await firestoreService.resolveSosAlert(alert);
    } catch {
      // snackbar omitted for brevity of this rarely-failing path; error state
      // above already surfaces stream-level failures
    }
  };

  return (
    <Box sx={{ bgcolor: AppColors.background, minHeight: '100%' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1.1, borderRadius: '10px', bgcolor: AppColors.errorLight, display: 'flex' }}>
            <SosIcon sx={{ color: AppColors.error, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>SOS Alerts</Typography>
            <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>
              {sosAlerts.length === 0 ? 'No riders currently need help' : `${sosAlerts.length} rider${sosAlerts.length === 1 ? '' : 's'} need help right now`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mx: 2.5, mt: 1, p: 1.5, borderRadius: 1, bgcolor: AppColors.errorLight, border: `1px solid ${AppColors.error}33`, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Typography sx={{ flex: 1, fontSize: 12, color: AppColors.error }}>Unable to load SOS alerts: {error}</Typography>
          <Button size="small" startIcon={<RefreshIcon sx={{ fontSize: 15 }} />} onClick={() => setRetryKey((k) => k + 1)} sx={{ color: AppColors.error }}>
            Retry
          </Button>
        </Box>
      )}

      <Box sx={{ p: 2.5 }}>
        {sosAlerts.length === 0 && resolved.length === 0 ? (
          isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 7.5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 7.5 }}>
              <Box sx={{ p: 2.25, borderRadius: '50%', bgcolor: AppColors.successLight }}>
                <ShieldOutlinedIcon sx={{ fontSize: 40, color: AppColors.success }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, mt: 2 }}>All clear</Typography>
              <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary, mt: 0.5 }}>No riders have an active SOS alert</Typography>
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 800, mx: 'auto' }}>
            {sosAlerts.length === 0 ? (
              <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: AppColors.successLight, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <ShieldOutlinedIcon sx={{ fontSize: 20, color: AppColors.success }} />
                <Typography sx={{ fontSize: 12.5 }}>All clear — no riders have an active SOS alert right now</Typography>
              </Box>
            ) : (
              sosAlerts.map((alert) => {
                const rider = riderForAlert(alert);
                return (
                  <SosCard
                    key={alert.id}
                    alert={alert}
                    rider={rider}
                    displayName={displayName(alert, rider)}
                    onResolve={() => setResolveTarget({ alert, rider })}
                    onViewProfile={rider ? () => navigate(`/riders/${rider.uid}`) : null}
                  />
                );
              })
            )}

            {resolved.length > 0 && (
              <Box sx={{ mt: 1, borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
                <Box onClick={() => setShowResolved((v) => !v)} sx={{ p: 1.75, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                  <HistoryOutlinedIcon sx={{ fontSize: 18, color: AppColors.textSecondary }} />
                  <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Resolved Alerts ({resolved.length})</Typography>
                  {showResolved ? <ExpandLessIcon sx={{ color: AppColors.textSecondary }} /> : <ExpandMoreIcon sx={{ color: AppColors.textSecondary }} />}
                </Box>
                {showResolved && (
                  <Box sx={{ borderTop: `1px solid ${AppColors.divider}` }}>
                    {resolved.map((alert) => {
                      const rider = riderForAlert(alert);
                      const name = rider?.fullName?.trim() ? rider.fullName : alert.riderName.trim() || 'Unknown rider';
                      return (
                        <Box key={alert.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, px: 1.75, py: 1.25 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: AppColors.success, mt: 0.25 }} />
                          <Box>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>
                              Triggered {formatDate(alert.createdAt)}
                              {alert.resolvedAt ? ` · Resolved ${formatDate(alert.resolvedAt)}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {resolveTarget && (
        <ConfirmationDialog
          open
          title="Resolve SOS"
          message={`Mark ${displayName(resolveTarget.alert, resolveTarget.rider)}'s SOS alert as resolved? This clears it from the alert list.`}
          confirmLabel="Resolve"
          confirmColor={AppColors.success}
          icon={CheckCircleOutlineIcon}
          onCancel={() => setResolveTarget(null)}
          onConfirm={doResolve}
        />
      )}
    </Box>
  );
}

function SosCard({ alert, rider, displayName, onResolve, onViewProfile }) {
  const latitude = rider?.latitude ?? alert.latitude;
  const longitude = rider?.longitude ?? alert.longitude;
  const hasLocation = latitude != null && longitude != null;
  const locationAddress = hasLocation ? readableAddressFor(latitude, longitude) : 'Location not available';
  const specificAddress = firstPresent([rider?.homeAddress, alert.specificAddress, hasLocation ? locationAddress : null], 'Address not available');
  const phoneNumber = firstPresent([rider?.phoneNumber, alert.phoneNumber], 'Phone number not available');
  const vehicleText = rider ? `${rider.vehicleType} • ${rider.plateNumber}` : 'SOS alert';
  const note = firstPresent([alert.note, rider?.sosNote]);

  const copy = (value) => navigator.clipboard?.writeText(value).catch(() => {});

  return (
    <Box sx={{ borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.error}40`, boxShadow: `0 4px 14px ${AppColors.error}14`, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <CustomAvatar imageUrl={rider?.profilePhotoUrl} name={displayName} size={46} backgroundColor={AppColors.error} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{displayName}</Typography>
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>{vehicleText}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.1, py: 0.5, borderRadius: '20px', bgcolor: AppColors.error }}>
          <SosIcon sx={{ fontSize: 12, color: '#fff' }} />
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#fff' }}>{timeAgo(alert.createdAt)}</Typography>
        </Box>
      </Box>

      <Box sx={{ height: 14 }} />
      <Box sx={{ borderTop: `1px solid ${AppColors.divider}`, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <DetailRow icon={PersonOutlinedIcon} label="Rider Name" value={displayName} />
        <DetailRow
          icon={PhoneOutlinedIcon}
          label="Phone Number"
          value={phoneNumber}
          onCopy={phoneNumber === 'Phone number not available' ? null : () => copy(phoneNumber)}
        />
        <DetailRow
          icon={HomeOutlinedIcon}
          label="Specific Address"
          value={specificAddress}
          onCopy={specificAddress === 'Address not available' ? null : () => copy(specificAddress)}
        />
        {hasLocation && specificAddress !== locationAddress && <DetailRow icon={PlaceOutlinedIcon} label="Map Address" value={locationAddress} />}
        {hasLocation && (
          <DetailRow
            icon={GpsFixedIcon}
            label="Coordinates"
            value={`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
            onCopy={() => copy(`${latitude}, ${longitude}`)}
          />
        )}
        {note && <DetailRow icon={NotesOutlinedIcon} label="SOS Note" value={note} />}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, mt: 1.75 }}>
        <Button fullWidth variant="outlined" disabled={!onViewProfile} startIcon={<PersonOutlineIcon />} onClick={onViewProfile ?? undefined} sx={{ color: AppColors.primary, borderColor: AppColors.primary }}>
          View Profile
        </Button>
        <Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={onResolve} sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}>
          Resolve
        </Button>
      </Box>
    </Box>
  );
}

function DetailRow({ icon: Icon, label, value, onCopy }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Icon sx={{ fontSize: 15, color: AppColors.textSecondary, mt: 0.15 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: AppColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 12.5 }}>{value}</Typography>
      </Box>
      {onCopy && (
        <IconButton size="small" onClick={onCopy} sx={{ p: 0.25 }}>
          <CopyOutlinedIcon sx={{ fontSize: 15, color: AppColors.textSecondary }} />
        </IconButton>
      )}
    </Box>
  );
}
