import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Divider, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import { EmptyState } from '../../components/EmptyState';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RejectReasonDialog from '../../components/RejectReasonDialog';

// Mirrors lib/screens/stores/pending_store_approvals_screen.dart
export default function PendingStoreApprovalsScreen() {
  const provider = useStores();
  const navigate = useNavigate();
  const [rejectStore, setRejectStore] = useState(null);
  const [approveStore, setApproveStore] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const pending = provider.pendingApprovals;
  const showResult = (ok, msg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? msg : 'Failed' });

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>Pending Store Approvals</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {pending.length === 0 ? (
          <EmptyState icon={CheckCircleOutlineIcon} title="No Pending Approvals" subtitle="All store applications have been reviewed" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, maxWidth: 720, mx: 'auto' }}>
            {pending.map((store) => (
              <Box key={store.id} sx={{ borderRadius: '12px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.warning}4D`, boxShadow: `0 4px 8px ${AppColors.shadow}` }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CustomAvatar imageUrl={store.logoUrl} name={store.name} size={52} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{store.name}</Typography>
                    {store.ownerName && <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>Owner: {store.ownerName}</Typography>}
                    {store.phoneNumber && <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>{store.phoneNumber}</Typography>}
                  </Box>
                  <Box sx={{ px: 1, py: 0.5, borderRadius: '6px', bgcolor: AppColors.warningLight, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: AppColors.warning }}>Pending</Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <InfoChip icon={LocationOnOutlinedIcon} label={store.address} />
                  <InfoChip icon={CategoryOutlinedIcon} label={store.category} />
                  <InfoChip icon={CalendarTodayIcon} label={`Applied ${formatDate(store.createdAt)}`} />
                </Box>
                <Box sx={{ height: 12 }} />
                <Divider />
                <Box sx={{ p: 1.5, display: 'flex', gap: 1.25 }}>
                  <Button fullWidth variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => navigate(`/stores/${store.id}`)} sx={{ color: AppColors.primary, borderColor: AppColors.primary }}>
                    View Docs
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<CloseIcon />} onClick={() => setRejectStore(store)} sx={{ color: AppColors.error, borderColor: AppColors.error }}>
                    Reject
                  </Button>
                  <Button fullWidth variant="contained" startIcon={<CheckIcon />} onClick={() => setApproveStore(store)} sx={{ bgcolor: AppColors.success, '&:hover': { bgcolor: AppColors.success } }}>
                    Approve
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {approveStore && (
        <ConfirmationDialog
          open
          title="Approve Store"
          message={`Approve ${approveStore.name}? It will become visible to customers.`}
          confirmLabel="Approve"
          confirmColor={AppColors.success}
          icon={CheckCircleOutlineIcon}
          onCancel={() => setApproveStore(null)}
          onConfirm={async () => {
            const store = approveStore;
            setApproveStore(null);
            const ok = await provider.approveStore(store.id);
            showResult(ok, `${store.name} approved successfully`);
          }}
        />
      )}

      {rejectStore && (
        <RejectReasonDialog
          open
          title="Reject Application"
          prompt={`Provide a reason for rejecting ${rejectStore.name}'s application:`}
          minLength={1}
          onCancel={() => setRejectStore(null)}
          onConfirm={async (reason) => {
            const store = rejectStore;
            setRejectStore(null);
            const ok = await provider.rejectStore(store.id, reason);
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
