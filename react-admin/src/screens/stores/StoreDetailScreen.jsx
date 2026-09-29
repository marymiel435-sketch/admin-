import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, IconButton, Menu, MenuItem, Divider, Button, Dialog, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StoreIcon from '@mui/icons-material/Store';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import StarIcon from '@mui/icons-material/Star';
import { AppColors } from '../../theme/colors';
import { useStores } from '../../context/StoreContext';
import { SubscriptionState } from '../../models/storeModel';
import { formatDate } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import StatusChip from '../../components/StatusChip';
import SubscriptionStateChip from '../../components/SubscriptionStateChip';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RejectReasonDialog from '../../components/RejectReasonDialog';

// Mirrors lib/screens/stores/store_detail_screen.dart
export default function StoreDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useStores();
  const store = provider.allStores.find((s) => s.id === id);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmType, setConfirmType] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fullImage, setFullImage] = useState(null); // { url, title }
  const [snackbar, setSnackbar] = useState(null);

  if (!store) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: AppColors.textSecondary }}>Store not found.</Typography>
      </Box>
    );
  }

  const showResult = (ok, msg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? msg : 'Failed' });

  const handleAction = async (action) => {
    setMenuAnchor(null);
    switch (action) {
      case 'approve': {
        const ok = await provider.approveStore(store.id);
        showResult(ok, 'Store approved');
        if (ok) navigate(-1);
        break;
      }
      case 'reject':
        setRejectOpen(true);
        break;
      case 'suspend':
        setConfirmType('suspend');
        break;
      case 'activate': {
        const ok = await provider.activateStore(store.id);
        showResult(ok, 'Store reactivated');
        if (ok) navigate(-1);
        break;
      }
      case 'delete':
        setConfirmType('delete');
        break;
      default:
        break;
    }
  };

  const confirmAction = async () => {
    const type = confirmType;
    setConfirmType(null);
    if (type === 'suspend') {
      const ok = await provider.suspendStore(store.id);
      showResult(ok, 'Store suspended');
      if (ok) navigate(-1);
    } else if (type === 'delete') {
      const ok = await provider.deleteStore(store.id);
      showResult(ok, 'Store deleted');
      if (ok) navigate(-1);
    }
  };

  const subType = store.category === 'Bills' ? store.billType : store.category === 'Pabili Store' ? store.pabiliType : null;
  const categoryLabel = subType ? `${store.category}  ·  ${subType}` : store.category;
  const docs = [
    ['Business Permit', store.permitPhotoUrl],
    ['Owner ID', store.idPhotoUrl],
  ].filter(([, url]) => Boolean(url));

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1, flex: 1 }}>Store Details</Typography>
        <IconButton onClick={() => navigate(`/stores/${store.id}/products`)} sx={{ color: '#fff' }} title="View Menu">
          <RestaurantMenuOutlinedIcon />
        </IconButton>
        <IconButton onClick={() => navigate(`/stores/${store.id}/edit`)} sx={{ color: '#fff' }} title="Edit Store">
          <EditOutlinedIcon />
        </IconButton>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {store.isPending && (
            <MenuItem onClick={() => handleAction('approve')}>
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Approve Store
            </MenuItem>
          )}
          {store.isPending && (
            <MenuItem onClick={() => handleAction('reject')}>
              <CloseIcon fontSize="small" sx={{ color: AppColors.error, mr: 1 }} /> Reject Application
            </MenuItem>
          )}
          {store.isApproved && (
            <MenuItem onClick={() => handleAction('suspend')}>
              <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} /> Suspend Store
            </MenuItem>
          )}
          {store.isSuspended && (
            <MenuItem onClick={() => handleAction('activate')}>
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Reactivate Store
            </MenuItem>
          )}
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete Store
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720, mx: 'auto' }}>
        {/* Profile card */}
        <Box sx={{ p: 3, borderRadius: 2, background: `linear-gradient(135deg, ${AppColors.gradientPrimary[0]}, ${AppColors.gradientPrimary[1]})`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: store.logoUrl ? `url(${store.logoUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!store.logoUrl && <StoreIcon sx={{ color: '#fff', fontSize: 40 }} />}
          </Box>
          <Typography sx={{ color: '#fff', fontSize: 22, fontWeight: 700, mt: 1.75, textAlign: 'center' }}>{store.name}</Typography>
          {store.ownerName && <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, mt: 0.25 }}>Owner: {store.ownerName}</Typography>}
          <Box sx={{ mt: 1, px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{categoryLabel}</Typography>
          </Box>
          <Box sx={{ mt: 1.25 }}>
            <StatusChip status={store.accountStatus} fontSize={12} />
          </Box>
        </Box>

        {store.isRejected && store.rejectionReason && (
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: AppColors.errorLight, border: `1px solid ${AppColors.error}4D`, display: 'flex', gap: 1.25 }}>
            <InfoOutlinedIcon sx={{ color: AppColors.error, fontSize: 18, mt: 0.25 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: AppColors.error }}>Rejection Reason</Typography>
              <Typography sx={{ fontSize: 13, mt: 0.5 }}>{store.rejectionReason}</Typography>
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<RestaurantMenuOutlinedIcon />}
          onClick={() => navigate(`/stores/${store.id}/products`)}
          sx={{ py: 1.5, color: AppColors.primary, borderColor: AppColors.primary }}
        >
          View Menu / Products
        </Button>

        <DetailCard
          title="Store Information"
          icon={InfoOutlinedIcon}
          rows={[
            ['Name', store.name],
            ...(store.ownerName ? [['Owner', store.ownerName]] : []),
            ['Category', store.category],
            ...(store.category === 'Bills' && store.billType ? [['Bill Type', store.billType]] : []),
            ...(store.category === 'Pabili Store' && store.pabiliType ? [['Pabili Type', store.pabiliType]] : []),
            ['Address', store.address],
            ...(store.phoneNumber ? [['Phone', store.phoneNumber]] : []),
            ...(store.email ? [['Email', store.email]] : []),
            ...(store.description ? [['Description', store.description]] : []),
            ['Submitted', formatDate(store.createdAt)],
            ['Updated', formatDate(store.updatedAt)],
          ]}
        />

        {/* Subscription card */}
        <DetailCard title="Maintenance Subscription" icon={WorkspacePremiumOutlinedIcon}>
          <Box sx={{ px: 2, py: 1.25 }}>
            <SubscriptionStateChip state={store.subscriptionState} fontSize={12} />
          </Box>
          {store.planId && <InfoRow label="Plan" value={store.planId} />}
          {store.trialEndsAt && <InfoRow label="Trial Ends" value={formatDate(store.trialEndsAt)} />}
          {store.subscriptionEndsAt && <InfoRow label="Subscription Ends" value={formatDate(store.subscriptionEndsAt)} />}
          {store.subscriptionState === SubscriptionState.rejected && store.subscriptionRejectionReason && (
            <Box sx={{ mx: 2, mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: AppColors.errorLight }}>
              <Typography sx={{ fontSize: 12.5, color: AppColors.error }}>Rejection reason: {store.subscriptionRejectionReason}</Typography>
            </Box>
          )}
          {store.subscriptionState === SubscriptionState.pendingReview ? (
            <Box sx={{ mx: 2, mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ReceiptLongOutlinedIcon />}
                onClick={() => navigate('/stores/subscription-reviews')}
                sx={{ color: AppColors.warning, borderColor: AppColors.warning }}
              >
                Review Payment Receipt
              </Button>
            </Box>
          ) : (
            <Box sx={{ height: 6 }} />
          )}
        </DetailCard>

        {/* Documents */}
        {docs.length > 0 && (
          <Box sx={{ borderRadius: 2, bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <DocumentScannerOutlinedIcon sx={{ color: AppColors.primary, fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Submitted Documents</Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {docs.map(([label, url]) => (
                <Box key={label} sx={{ flex: '1 1 220px', cursor: 'pointer' }} onClick={() => setFullImage({ url, title: label })}>
                  <Box
                    sx={{
                      height: 140,
                      borderRadius: '10px',
                      bgcolor: AppColors.background,
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, mt: 0.75, textAlign: 'center' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Performance */}
        <DetailCard title="Performance" icon={BarChartOutlinedIcon}>
          <Box sx={{ display: 'flex', gap: 1.5, p: 2 }}>
            <StatBox icon={StarIcon} iconColor="#FFC107" label="Rating" value={store.rating.toFixed(1)} />
            <StatBox icon={ReceiptLongOutlinedIcon} iconColor={AppColors.primary} label="Total Orders" value={String(store.totalOrders)} />
            <StatBox
              icon={store.isApproved ? CheckCircleOutlineIcon : BlockIcon}
              iconColor={store.isApproved ? AppColors.success : AppColors.error}
              label="Status"
              value={store.accountStatus}
            />
          </Box>
        </DetailCard>
      </Box>

      <Dialog open={Boolean(fullImage)} onClose={() => setFullImage(null)} maxWidth="md">
        {fullImage && (
          <Box sx={{ bgcolor: '#000' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, color: '#fff' }}>
              <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{fullImage.title}</Typography>
              <IconButton onClick={() => setFullImage(null)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              component="img"
              src={fullImage.url}
              alt={fullImage.title}
              sx={{ display: 'block', maxWidth: '90vw', maxHeight: '80vh', mx: 'auto' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Box>
        )}
      </Dialog>

      {confirmType && (
        <ConfirmationDialog
          open
          title={confirmType === 'suspend' ? 'Suspend Store' : 'Delete Store'}
          message={
            confirmType === 'suspend'
              ? `Suspend ${store.name}? It will be hidden from customers.`
              : `Permanently delete ${store.name}? This also deletes its products, images, and subscription payment records. This cannot be undone.`
          }
          confirmLabel={confirmType === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmType === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmType === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmType(null)}
          onConfirm={confirmAction}
        />
      )}

      {rejectOpen && (
        <RejectReasonDialog
          open
          title="Reject Application"
          prompt="Provide a rejection reason:"
          minLength={1}
          onCancel={() => setRejectOpen(false)}
          onConfirm={async (reason) => {
            setRejectOpen(false);
            const ok = await provider.rejectStore(store.id, reason);
            showResult(ok, 'Rejected');
            if (ok) navigate(-1);
          }}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>
    </Box>
  );
}

function DetailCard({ title, icon: Icon, rows, children }) {
  return (
    <Box sx={{ borderRadius: 2, bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <Icon sx={{ color: AppColors.primary, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      </Box>
      <Divider />
      {rows && rows.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
      {children}
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', px: 2, py: 1.25 }}>
      <Typography sx={{ width: 120, flexShrink: 0, fontSize: 13, color: AppColors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

function StatBox({ icon: Icon, iconColor, label, value }) {
  return (
    <Box sx={{ flex: 1, p: 1.75, borderRadius: '12px', bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Icon sx={{ color: iconColor, fontSize: 22 }} />
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: iconColor, mt: 0.5 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}
