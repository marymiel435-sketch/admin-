import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Menu, MenuItem, Snackbar, Alert, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { AppColors } from '../../theme/colors';
import { useCustomers } from '../../context/CustomerContext';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import StatusChip from '../../components/StatusChip';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Mirrors lib/screens/customers/customer_detail_screen.dart
export default function CustomerDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useCustomers();
  const customer = provider.allCustomers.find((c) => c.uid === id);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmType, setConfirmType] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  if (!customer) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: AppColors.textSecondary }}>Customer not found.</Typography>
      </Box>
    );
  }

  const isSuspended = customer.accountStatus === 'Suspended';
  const age = Math.floor((Date.now() - customer.dateOfBirth.getTime()) / (365 * 24 * 60 * 60 * 1000));

  const handleAction = async (action) => {
    setMenuAnchor(null);
    if (action === 'suspend' || action === 'delete') {
      setConfirmType(action);
      return;
    }
    if (action === 'activate') {
      const ok = await provider.activateCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account reactivated' : 'Failed' });
      if (ok) navigate(-1);
    }
  };

  const confirmAction = async () => {
    const type = confirmType;
    setConfirmType(null);
    if (type === 'suspend') {
      const ok = await provider.suspendCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account suspended' : 'Failed' });
      if (ok) navigate(-1);
    } else if (type === 'delete') {
      const ok = await provider.deleteCustomer(customer.uid);
      setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? 'Account deleted' : 'Failed' });
      if (ok) navigate(-1);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box
        sx={{
          height: 64,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: AppColors.primary,
          color: '#fff',
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1 }}>Customer Details</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => handleAction(isSuspended ? 'activate' : 'suspend')}>
            {isSuspended ? (
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} />
            ) : (
              <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} />
            )}
            {isSuspended ? 'Reactivate' : 'Suspend Account'}
          </MenuItem>
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Account
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720, mx: 'auto' }}>
        {/* Profile card */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${AppColors.gradientPrimary[0]}, ${AppColors.gradientPrimary[1]})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CustomAvatar imageUrl={customer.profileImage} name={customer.fullName} size={80} backgroundColor="rgba(255,255,255,0.3)" />
          <Typography sx={{ color: '#fff', fontSize: 20, fontWeight: 700, mt: 1.5 }}>{customer.fullName}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, mt: 0.5 }}>@{customer.username}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mt: 0.5 }}>{customer.email}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1.5 }}>
            <StatusChip status={customer.accountStatus} fontSize={12} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: customer.isOnline ? AppColors.success : AppColors.statusOffline }} />
              <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{customer.isOnline ? 'Online' : 'Offline'}</Typography>
            </Box>
            {customer.emailVerified && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <VerifiedIcon sx={{ fontSize: 12, color: '#fff' }} />
                <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>Verified</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <DetailCard
          title="Account Information"
          icon={PersonOutlinedIcon}
          rows={[
            ['First Name', customer.firstName],
            ['Last Name', customer.lastName],
            ...(customer.middleName ? [['Middle Name', customer.middleName]] : []),
            ['Date of Birth', formatDate(customer.dateOfBirth)],
            ['Age', `${age} years old`],
            ['Gender', customer.gender],
            ['Phone', customer.phoneNumber],
            ['Email', customer.email],
            ['Username', customer.username],
            ['Home Address', customer.homeAddress],
            ['Registered', formatDate(customer.createdAt)],
            ['Last Updated', formatDate(customer.updatedAt)],
          ]}
        />

        <DetailCard
          title="Account Status"
          icon={ShieldOutlinedIcon}
          rows={[
            ['Status', customer.accountStatus],
            ['Online', customer.isOnline ? 'Online' : 'Offline'],
            ['Email Verified', customer.emailVerified ? 'Yes ✓' : 'No'],
          ]}
        />
      </Box>

      {confirmType && (
        <ConfirmationDialog
          open
          title={confirmType === 'suspend' ? 'Suspend Account' : 'Delete Account'}
          message={
            confirmType === 'suspend'
              ? `Suspend ${customer.fullName}'s account? They cannot place orders.`
              : `Permanently delete ${customer.fullName}'s account? This also deletes their profile image and login. This cannot be undone.`
          }
          confirmLabel={confirmType === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmType === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmType === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmType(null)}
          onConfirm={confirmAction}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}

function DetailCard({ title, icon: Icon, rows }) {
  return (
    <Box sx={{ borderRadius: 2, bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <Icon sx={{ color: AppColors.primary, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      </Box>
      <Divider />
      {rows.map(([label, value]) => (
        <Box key={label} sx={{ display: 'flex', px: 2, py: 1.25 }}>
          <Typography sx={{ width: 140, flexShrink: 0, fontSize: 13, color: AppColors.textSecondary }}>{label}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: AppColors.textPrimary }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
