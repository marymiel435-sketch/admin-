import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Divider, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import MotorcycleIcon from '@mui/icons-material/TwoWheeler';
import NumbersIcon from '@mui/icons-material/Numbers';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState } from '../../components/EmptyState';
import RejectReasonDialog from '../../components/RejectReasonDialog';
import DocumentChecklistDialog from '../../components/DocumentChecklistDialog';

// Mirrors lib/screens/riders/office_visit_screen.dart — Stage 2 of the rider
// approval flow, worked in person once a rider asked to bring documents
// (Stage 1, Pending Approvals) actually walks in with them.
export default function OfficeVisitScreen() {
  const provider = useRiders();
  const navigate = useNavigate();
  const [rejectRider, setRejectRider] = useState(null);
  const [checklistRider, setChecklistRider] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const riders = provider.documentsRequested;
  const showResult = (ok, msg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? msg : 'Failed' });

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>Awaiting Office Visit</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {riders.length === 0 ? (
          <EmptyState icon={StorefrontOutlinedIcon} title="No One Awaiting a Visit" subtitle="Riders who were asked to bring documents will show up here" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxWidth: 720, mx: 'auto' }}>
            {riders.map((rider) => (
              <Box key={rider.uid} sx={{ borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.info}4D`, boxShadow: `0 4px 8px ${AppColors.shadow}` }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CustomAvatar imageUrl={rider.profilePhotoUrl} name={rider.fullName} size={52} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{rider.fullName}</Typography>
                    <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>{rider.phoneNumber}</Typography>
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>{rider.email}</Typography>
                  </Box>
                  <Box sx={{ px: 1, py: 0.5, borderRadius: '6px', bgcolor: AppColors.infoLight, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: AppColors.info }}>Docs Requested</Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <InfoChip icon={MotorcycleIcon} label={`${rider.motorcycleBrand} ${rider.motorcycleModel}`} />
                  <InfoChip icon={NumbersIcon} label={rider.plateNumber} />
                  <InfoChip icon={BadgeOutlinedIcon} label={rider.licenseNumber} />
                  <InfoChip icon={EventAvailableIcon} label={`Requested ${formatDate(rider.updatedAt)}`} />
                </Box>
                <Box sx={{ height: 12 }} />
                <Divider />
                <Box sx={{ p: 1.5, display: 'flex', gap: 1.25 }}>
                  <Button fullWidth variant="outlined" startIcon={<PersonOutlineIcon />} onClick={() => navigate(`/riders/${rider.uid}`)} sx={{ color: AppColors.primary, borderColor: AppColors.primary }}>
                    View Profile
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<CloseIcon />} onClick={() => setRejectRider(rider)} sx={{ color: AppColors.error, borderColor: AppColors.error }}>
                    Reject
                  </Button>
                  <Button fullWidth variant="contained" startIcon={<VerifiedOutlinedIcon />} onClick={() => setChecklistRider(rider)} sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}>
                    Verify Docs
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {checklistRider && (
        <DocumentChecklistDialog
          open
          rider={checklistRider}
          onCancel={() => setChecklistRider(null)}
          onConfirm={async () => {
            const rider = checklistRider;
            setChecklistRider(null);
            const ok = await provider.activateRider(rider.uid);
            showResult(ok, `${rider.firstName}'s account is now active`);
          }}
        />
      )}

      {rejectRider && (
        <RejectReasonDialog
          open
          title="Reject Application"
          prompt={`Documents didn't check out for ${rejectRider.firstName}. Provide a reason:`}
          onCancel={() => setRejectRider(null)}
          onConfirm={async (reason) => {
            const rider = rejectRider;
            setRejectRider(null);
            const ok = await provider.rejectRider(rider.uid, reason);
            showResult(ok, 'Application rejected');
          }}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function InfoChip({ icon: Icon, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: '6px', bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}` }}>
      <Icon sx={{ fontSize: 12, color: AppColors.textSecondary }} />
      <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>{label}</Typography>
    </Box>
  );
}
