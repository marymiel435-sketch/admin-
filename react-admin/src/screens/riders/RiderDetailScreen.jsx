import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Box, Typography, IconButton, Menu, MenuItem, Divider, CircularProgress, Snackbar, Alert, Dialog } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MotorcycleIcon from '@mui/icons-material/TwoWheeler';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import { usePresence } from '../../context/PresenceContext';
import * as firestoreService from '../../services/firestoreService';
import { formatDate, formatDuration, formatCurrency, formatDistance, getServiceTypeColor, getServiceTypeIcon } from '../../utils/appUtils';
import CustomAvatar from '../../components/CustomAvatar';
import StatusChip from '../../components/StatusChip';
import { pinIcon } from '../../components/MapPinIcon';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RejectReasonDialog from '../../components/RejectReasonDialog';
import DocumentChecklistDialog from '../../components/DocumentChecklistDialog';

const HISTORY_PAGE_SIZE = 5;

// Mirrors lib/screens/riders/rider_detail_screen.dart
export default function RiderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const provider = useRiders();
  const presence = usePresence();
  const rider = provider.allRiders.find((r) => r.uid === id);

  const [deliveries, setDeliveries] = useState(null);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [historyPage, setHistoryPage] = useState(0);
  const [riderSharePercent, setRiderSharePercent] = useState(80.0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmType, setConfirmType] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    provider
      .getRiderDeliveries(id)
      .then((list) => {
        setDeliveries(list);
        setLoadingDeliveries(false);
      })
      .catch(() => setLoadingDeliveries(false));
    firestoreService
      .getFareSettings()
      .then((data) => setRiderSharePercent(typeof data.riderSharePercent === 'number' ? data.riderSharePercent : 80.0))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!rider) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: AppColors.textSecondary }}>Rider not found.</Typography>
      </Box>
    );
  }

  const showResult = (ok, msg) => setSnackbar({ severity: ok ? 'success' : 'error', message: ok ? msg : 'Failed' });
  const isOnline = presence.isRiderOnline(rider);
  const age = Math.floor((Date.now() - rider.dateOfBirth.getTime()) / (365 * 24 * 60 * 60 * 1000));
  const hasLocation = rider.latitude != null && rider.longitude != null;
  const hasReadableAddress = rider.purok != null && rider.barangay != null;

  const list = deliveries ?? [];
  const completed = list.filter((d) => d.isCompleted).length;
  const cancelled = list.filter((d) => d.isCancelled).length;
  const decided = completed + cancelled;
  const completionRate = decided > 0 ? (completed / decided) * 100 : null;

  const responseTimes = list
    .filter((d) => d.acceptedAt && d.assignedAt)
    .map((d) => (d.acceptedAt.getTime() - d.assignedAt.getTime()) / 60000);
  const avgResponseTime = responseTimes.length === 0 ? null : responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

  const deliveryTimes = list
    .filter((d) => d.deliveredAt && d.acceptedAt)
    .map((d) => (d.deliveredAt.getTime() - d.acceptedAt.getTime()) / 60000);
  const avgDeliveryTime = deliveryTimes.length === 0 ? null : deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;

  const revenue = list.filter((d) => d.isCompleted).reduce((sum, d) => sum + (d.deliveryFee ?? 0), 0);

  const historyTotal = list.length;
  const historyMaxPage = Math.max(0, Math.ceil(historyTotal / HISTORY_PAGE_SIZE) - 1);
  const currentHistoryPage = Math.min(historyPage, historyMaxPage);
  const historyStart = currentHistoryPage * HISTORY_PAGE_SIZE;
  const historyEnd = Math.min(historyStart + HISTORY_PAGE_SIZE, historyTotal);
  const historyPageItems = list.slice(historyStart, historyEnd);

  const handleMenu = async (action) => {
    setMenuAnchor(null);
    switch (action) {
      case 'edit':
        navigate(`/riders/${rider.uid}/edit`);
        break;
      case 'requestDocuments':
        setConfirmType('requestDocuments');
        break;
      case 'activateAccount':
        setChecklistOpen(true);
        break;
      case 'reject':
        setRejectOpen(true);
        break;
      case 'suspend':
        setConfirmType('suspend');
        break;
      case 'activate': {
        const ok = await provider.activateRider(rider.uid);
        showResult(ok, 'Rider reactivated');
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
    if (type === 'requestDocuments') {
      const ok = await provider.requestDocuments(rider.uid);
      showResult(ok, 'Documents requested');
      if (ok) navigate(-1);
    } else if (type === 'suspend') {
      const ok = await provider.suspendRider(rider.uid);
      showResult(ok, 'Rider suspended');
      if (ok) navigate(-1);
    } else if (type === 'delete') {
      const ok = await provider.deleteRider(rider.uid);
      showResult(ok, 'Rider deleted');
      if (ok) navigate(-1);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: AppColors.background }}>
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', bgcolor: AppColors.primary, color: '#fff' }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontSize: 18, fontWeight: 600, ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rider.fullName}</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => handleMenu('edit')}>
            <EditOutlinedIcon fontSize="small" sx={{ color: AppColors.info, mr: 1 }} /> Edit Rider
          </MenuItem>
          {rider.isPendingApproval && (
            <MenuItem onClick={() => handleMenu('requestDocuments')}>
              <MarkEmailReadOutlinedIcon fontSize="small" sx={{ color: AppColors.info, mr: 1 }} /> Request Documents
            </MenuItem>
          )}
          {rider.isDocumentsRequested && (
            <MenuItem onClick={() => handleMenu('activateAccount')}>
              <VerifiedOutlinedIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Activate Account
            </MenuItem>
          )}
          {(rider.isPendingApproval || rider.isDocumentsRequested) && (
            <MenuItem onClick={() => handleMenu('reject')}>
              <CloseIcon fontSize="small" sx={{ color: AppColors.error, mr: 1 }} /> Reject Application
            </MenuItem>
          )}
          {rider.isApproved && (
            <MenuItem onClick={() => handleMenu('suspend')}>
              <BlockIcon fontSize="small" sx={{ color: AppColors.warning, mr: 1 }} /> Suspend Rider
            </MenuItem>
          )}
          {rider.isSuspended && (
            <MenuItem onClick={() => handleMenu('activate')}>
              <CheckCircleOutlineIcon fontSize="small" sx={{ color: AppColors.success, mr: 1 }} /> Reactivate Rider
            </MenuItem>
          )}
          <MenuItem onClick={() => handleMenu('delete')} sx={{ color: AppColors.error }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720, mx: 'auto' }}>
        {/* Profile card */}
        <Box sx={{ p: 3, borderRadius: 2, background: `linear-gradient(135deg, ${AppColors.gradientPrimary[0]}, ${AppColors.gradientPrimary[1]})`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <CustomAvatar imageUrl={rider.profilePhotoUrl} name={rider.fullName} size={80} />
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: '50%', bgcolor: isOnline ? AppColors.success : AppColors.statusOffline, border: '2px solid #fff' }} />
          </Box>
          <Typography sx={{ color: '#fff', fontSize: 20, fontWeight: 700, mt: 1.5 }}>{rider.fullName}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'monospace', mt: 0.5 }}>{rider.uid}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <StatusChip status={rider.accountStatus} fontSize={12} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: isOnline ? AppColors.success : AppColors.statusOffline }} />
              <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{isOnline ? 'Online' : 'Offline'}</Typography>
            </Box>
          </Box>
        </Box>

        <SectionCard
          title="Personal Information"
          icon={PersonOutlinedIcon}
          rows={[
            ['First Name', rider.firstName],
            ['Last Name', rider.lastName],
            ...(rider.middleName ? [['Middle Name', rider.middleName]] : []),
            ...(rider.suffix ? [['Suffix', rider.suffix]] : []),
            ['Date of Birth', formatDate(rider.dateOfBirth)],
            ['Age', `${age} years old`],
            ['Gender', rider.gender],
            ['Phone', rider.phoneNumber],
            ['Email', rider.email],
            ...(rider.username ? [['Username', rider.username]] : []),
            ['Home Address', rider.homeAddress],
            ['Joined', formatDate(rider.createdAt)],
            ['Email Verified', rider.emailVerified ? 'Yes' : 'No'],
          ]}
        />

        <SectionCard
          title="Location"
          icon={LocationOnOutlinedIcon}
          rows={[
            ['Readable Address', hasReadableAddress ? `${rider.purok}, Barangay ${rider.barangay}, Trento, Agusan del Sur` : 'Not set'],
            ['Exact Coordinates', hasLocation ? `${rider.latitude.toFixed(6)}, ${rider.longitude.toFixed(6)}` : 'Not set'],
          ]}
        >
          {hasLocation && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ height: 180, borderRadius: 1.5, overflow: 'hidden' }}>
                <MapContainer
                  center={[rider.latitude, rider.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  dragging={false}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  boxZoom={false}
                  keyboard={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[rider.latitude, rider.longitude]} icon={pinIcon(AppColors.primary, 40)} />
                </MapContainer>
              </Box>
            </Box>
          )}
        </SectionCard>

        <SectionCard
          title="Vehicle & License"
          icon={MotorcycleIcon}
          rows={[
            ['Vehicle Type', rider.vehicleType],
            ['Motorcycle Brand', rider.motorcycleBrand],
            ['Motorcycle Model', rider.motorcycleModel],
            ['Vehicle Color', rider.vehicleColor],
            ['Plate Number', rider.plateNumber],
            ["Driver's License", rider.licenseNumber],
            ['License Expiry', formatDate(rider.licenseExpiry)],
          ]}
        />

        <SectionCard title="Verification Documents" icon={BadgeOutlinedIcon}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, p: 2 }}>
            <DocumentThumb label="Driver's License" url={rider.licensePhotoUrl} onView={setLightboxImage} />
            <DocumentThumb label="OR/CR" url={rider.orCrPhotoUrl} onView={setLightboxImage} />
            <DocumentThumb label="Selfie with License" url={rider.selfieWithLicenseUrl} onView={setLightboxImage} />
          </Box>
        </SectionCard>

        <SectionCard
          title="Performance"
          icon={StarOutlineIcon}
          rows={[
            ['Total Deliveries', String(rider.totalDeliveries)],
            ['Rating', rider.rating > 0 ? `${rider.rating.toFixed(1)} / 5.0 ★` : 'No ratings yet'],
          ]}
        >
          {loadingDeliveries ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={18} />
            </Box>
          ) : (
            <>
              {[
                ['Completion Rate', completionRate != null ? `${completionRate.toFixed(0)}% (${completed} of ${decided})` : 'No completed/cancelled deliveries yet'],
                ['Avg Response Time', avgResponseTime != null ? formatDuration(Math.round(avgResponseTime)) : 'Not enough data'],
                ['Avg Delivery Duration', avgDeliveryTime != null ? formatDuration(Math.round(avgDeliveryTime)) : 'Not enough data'],
                ['Revenue Generated', formatCurrency(revenue)],
                [`Rider Share (${riderSharePercent.toFixed(0)}%)`, formatCurrency((revenue * riderSharePercent) / 100)],
              ].map(([label, value]) => (
                <InfoRow key={label} label={label} value={value} />
              ))}
              <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, px: 2, pb: 1.5 }}>Based on the last 20 deliveries.</Typography>
            </>
          )}
        </SectionCard>

        {!loadingDeliveries && (
          <SectionCard title="Delivery History" icon={HistoryOutlinedIcon}>
            {list.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, p: 2 }}>No deliveries yet.</Typography>
            ) : (
              <>
                {historyPageItems.map((d) => (
                  <DeliveryHistoryRow key={d.id} delivery={d} />
                ))}
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
                  <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>
                    Showing {historyStart + 1}-{historyEnd} of {historyTotal}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <IconButton size="small" disabled={currentHistoryPage === 0} onClick={() => setHistoryPage(currentHistoryPage - 1)}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{currentHistoryPage + 1}</Typography>
                  <IconButton size="small" disabled={currentHistoryPage >= historyMaxPage} onClick={() => setHistoryPage(currentHistoryPage + 1)}>
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            )}
          </SectionCard>
        )}
      </Box>

      {confirmType && confirmType !== 'requestDocuments' && (
        <ConfirmationDialog
          open
          title={confirmType === 'suspend' ? 'Suspend Rider' : 'Delete Rider'}
          message={confirmType === 'suspend' ? `Suspend ${rider.fullName}?` : `Permanently delete ${rider.fullName}? This cannot be undone.`}
          confirmLabel={confirmType === 'suspend' ? 'Suspend' : 'Delete'}
          confirmColor={confirmType === 'suspend' ? AppColors.warning : AppColors.error}
          icon={confirmType === 'suspend' ? BlockIcon : DeleteOutlineIcon}
          onCancel={() => setConfirmType(null)}
          onConfirm={confirmAction}
        />
      )}
      {confirmType === 'requestDocuments' && (
        <ConfirmationDialog
          open
          title="Request Documents"
          message={`Ask ${rider.fullName} to visit the office with their license, OR/CR, and a selfie holding their license? This does NOT activate their account yet.`}
          confirmLabel="Request Documents"
          confirmColor={AppColors.info}
          icon={MarkEmailReadOutlinedIcon}
          onCancel={() => setConfirmType(null)}
          onConfirm={confirmAction}
        />
      )}

      {rejectOpen && (
        <RejectReasonDialog
          open
          title="Reject Application"
          prompt="Provide a rejection reason:"
          onCancel={() => setRejectOpen(false)}
          onConfirm={async (reason) => {
            setRejectOpen(false);
            const ok = await provider.rejectRider(rider.uid, reason);
            showResult(ok, 'Rejected');
            if (ok) navigate(-1);
          }}
        />
      )}

      {checklistOpen && (
        <DocumentChecklistDialog
          open
          rider={rider}
          onCancel={() => setChecklistOpen(false)}
          onConfirm={async () => {
            setChecklistOpen(false);
            const ok = await provider.activateRider(rider.uid);
            showResult(ok, 'Account activated');
            if (ok) navigate(-1);
          }}
        />
      )}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snackbar && <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert>}
      </Snackbar>

      <Dialog open={Boolean(lightboxImage)} onClose={() => setLightboxImage(null)} maxWidth="md">
        <Box sx={{ position: 'relative', bgcolor: '#000', display: 'flex' }}>
          <IconButton
            onClick={() => setLightboxImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
          >
            <CloseIcon />
          </IconButton>
          {lightboxImage && (
            <Box component="img" src={lightboxImage} alt="Document" sx={{ maxWidth: '90vw', maxHeight: '85vh', display: 'block', mx: 'auto' }} />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}

function DocumentThumb({ label, url, onView }) {
  return (
    <Box sx={{ width: 200 }}>
      <Box
        onClick={url ? () => onView(url) : undefined}
        sx={{
          height: 130,
          borderRadius: 1.5,
          border: `1px solid ${AppColors.divider}`,
          bgcolor: AppColors.background,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: url ? 'pointer' : 'default',
          '&:hover .zoom-overlay': { opacity: url ? 1 : 0 },
        }}
      >
        {url ? (
          <>
            <Box component="img" src={url} alt={label} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              className="zoom-overlay"
              sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.35)', opacity: 0, transition: 'opacity 0.15s',
              }}
            >
              <ZoomInIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, color: AppColors.textHint }}>
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: 11 }}>Not submitted</Typography>
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, mt: 0.75, textAlign: 'center' }}>{label}</Typography>
    </Box>
  );
}

function SectionCard({ title, icon: Icon, rows, children }) {
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
      <Typography sx={{ width: 150, flexShrink: 0, fontSize: 13, color: AppColors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

function DeliveryHistoryRow({ delivery }) {
  const Icon = getServiceTypeIcon(delivery.serviceType);
  const color = getServiceTypeColor(delivery.serviceType);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, px: 2, py: 1.5, borderBottom: `1px solid ${AppColors.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.4, borderRadius: '6px', bgcolor: `${color}1A`, flexShrink: 0 }}>
        <Icon sx={{ fontSize: 12, color }} />
        <Typography sx={{ fontSize: 11, fontWeight: 600, color }}>{delivery.serviceType}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{delivery.customerName || 'Unknown customer'}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 0.4 }}>
          <StatusChip status={delivery.status} fontSize={10} />
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>{formatCurrency(delivery.deliveryFee ?? 0)}</Typography>
          {delivery.distanceKm != null && <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>{formatDistance(delivery.distanceKm)}</Typography>}
          <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary }}>{delivery.customerRating != null ? `${delivery.customerRating} ★` : 'Not rated'}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, flexShrink: 0 }}>{formatDate(delivery.createdAt)}</Typography>
    </Box>
  );
}
