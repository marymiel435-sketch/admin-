import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, TextField, InputAdornment, IconButton, Menu, MenuItem, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { AppColors } from '../../theme/colors';
import { useRiders } from '../../context/RiderContext';
import { usePresence } from '../../context/PresenceContext';
import { readableAddressFor } from '../../services/purokLocationService';

const MARKER_PALETTE = ['#2563EB', '#16A34A', '#7C3AED', '#F59E0B', '#0891B2', '#E11D48'];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function markerColorFor(rider) {
  return MARKER_PALETTE[hashCode(rider.uid) % MARKER_PALETTE.length];
}

function riderIcon(rider, isSelected, isOnline) {
  const color = markerColorFor(rider);
  const circleSize = isSelected ? 46 : 36;
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="position:relative;width:${circleSize}px;height:${circleSize}px;">
        <div style="width:${circleSize}px;height:${circleSize}px;border-radius:50%;background:${color};border:${isSelected ? 3 : 2}px solid #fff;box-shadow:0 0 ${isSelected ? 14 : 6}px ${isSelected ? 3 : 0}px ${color}${isSelected ? '99' : '59'};display:flex;align-items:center;justify-content:center;">
          <svg width="${isSelected ? 22 : 17}" height="${isSelected ? 22 : 17}" viewBox="0 0 24 24" fill="#fff"><path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2 0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3c1.1 0 2-.9 2-2v-2.28c0-.79-.31-1.55-.87-2.11l-2.69-2.68zM8 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm10 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
        </div>
        ${isOnline ? `<div style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:${AppColors.statusOnline};border:2px solid #fff;"></div>` : ''}
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
      <div style="margin-top:2px;padding:5px 9px;background:#fff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:11.5px;font-weight:600;color:${AppColors.textPrimary};white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;">${rider.fullName}</div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [140, 90], iconAnchor: [circleSize / 2 + 2, circleSize + 12] });
}

// Mirrors lib/screens/tracking/live_tracking_screen.dart
export default function LiveTrackingScreen() {
  const provider = useRiders();
  const presence = usePresence();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isSatellite, setIsSatellite] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const mapRef = useRef(null);
  const [narrow, setNarrow] = useState(window.matchMedia('(max-width: 700px)').matches);

  useEffect(() => {
    provider.startListening();
    presence.startListening();
    const mq = window.matchMedia('(max-width: 700px)');
    const handler = (e) => setNarrow(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const all = provider.allRiders;
  const withLocation = useMemo(() => all.filter((r) => r.latitude != null && r.longitude != null), [all]);
  const onlineCount = presence.onlineCountFor(withLocation);

  let panelList = withLocation;
  if (filter === 'online') panelList = withLocation.filter((r) => presence.isRiderOnline(r));
  else if (filter === 'offline') panelList = withLocation.filter((r) => !presence.isRiderOnline(r));
  if (search) {
    const q = search.toLowerCase();
    panelList = panelList.filter((r) => r.fullName.toLowerCase().includes(q) || r.plateNumber.toLowerCase().includes(q));
  }

  const selected = selectedId ? all.find((r) => r.uid === selectedId) ?? null : null;

  const selectRider = (rider) => {
    setSelectedId(rider.uid);
    mapRef.current?.setView([rider.latitude, rider.longitude], 15);
  };

  const fitAll = () => {
    if (withLocation.length === 0 || !mapRef.current) return;
    if (withLocation.length === 1) {
      mapRef.current.setView([withLocation[0].latitude, withLocation[0].longitude], 15);
      return;
    }
    const bounds = L.latLngBounds(withLocation.map((r) => [r.latitude, r.longitude]));
    mapRef.current.fitBounds(bounds, { paddingTopLeft: [60, 80], paddingBottomRight: [narrow ? 60 : 300, 80] });
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <MapContainer center={[14.5995, 120.9842]} zoom={12} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <TileLayer
          url={isSatellite ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution={isSatellite ? 'Esri, Maxar, Earthstar Geographics' : 'OpenStreetMap contributors'}
          maxZoom={19}
        />
        {withLocation.map((rider) => (
          <Marker
            key={rider.uid}
            position={[rider.latitude, rider.longitude]}
            icon={riderIcon(rider, rider.uid === selectedId, presence.isRiderOnline(rider))}
            eventHandlers={{ click: () => selectRider(rider) }}
          />
        ))}
      </MapContainer>

      {/* Stats bar + controls */}
      <Box sx={{ position: 'absolute', top: 12, left: 12, right: narrow ? 12 : 282, display: 'flex', gap: 1.25, overflowX: 'auto', zIndex: 1000, pb: 0.5 }}>
        <MiniStat dot color={AppColors.statusOnline} value={`${onlineCount} Online`} subtitle="Riders online" />
        <MiniStat icon={LocationOnOutlinedIcon} value={`${withLocation.length} Located`} subtitle="Riders on map" />
        <MiniStat icon={PeopleOutlineIcon} value={`${all.length} Riders`} subtitle="Total riders" />
        {withLocation.length > 0 && (
          <Button size="small" variant="contained" onClick={fitAll} startIcon={<FitScreenIcon sx={{ fontSize: 15 }} />} sx={{ bgcolor: AppColors.surface, color: AppColors.primary, boxShadow: 2, '&:hover': { bgcolor: AppColors.surface }, flexShrink: 0, whiteSpace: 'nowrap' }}>
            Fit All
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          onClick={() => setIsSatellite((v) => !v)}
          startIcon={isSatellite ? <MapOutlinedIcon sx={{ fontSize: 15 }} /> : <SatelliteAltIcon sx={{ fontSize: 15 }} />}
          sx={{ bgcolor: AppColors.primary, boxShadow: 2, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {isSatellite ? 'Street Map' : 'Satellite'}
        </Button>
      </Box>

      {/* Legend */}
      {!selected && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 12, width: 190, p: 1.75, borderRadius: '12px', bgcolor: AppColors.surface, boxShadow: 3, zIndex: 1000 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>Rider Status</Typography>
          <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <LegendRow label="Online" count={onlineCount} color={AppColors.statusOnline} />
            <LegendRow label="Located" count={withLocation.length - onlineCount} color={AppColors.info} />
            <LegendRow label="Offline" count={all.length - withLocation.length} color={AppColors.textSecondary} />
          </Box>
        </Box>
      )}

      {/* Side/bottom panel */}
      <Box
        sx={
          narrow
            ? { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '55%', borderRadius: '16px 16px 0 0', bgcolor: AppColors.surface, boxShadow: 4, display: 'flex', flexDirection: 'column', zIndex: 1000 }
            : { position: 'absolute', right: 0, top: 0, bottom: 0, width: 270, bgcolor: AppColors.surface, borderLeft: `1px solid ${AppColors.divider}`, display: 'flex', flexDirection: 'column', zIndex: 1000 }
        }
      >
        <Box sx={{ p: '14px 16px 12px', bgcolor: AppColors.surface, borderBottom: `1px solid ${AppColors.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOnIcon sx={{ fontSize: 17 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>Rider Locations</Typography>
            <Box sx={{ px: 1.1, py: 0.4, borderRadius: '20px', bgcolor: AppColors.successLight }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: AppColors.success }}>{onlineCount} online</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5 }}>
            {['all', 'online', 'offline'].map((f) => (
              <FilterPill
                key={f}
                label={f === 'all' ? `All (${withLocation.length})` : `${f[0].toUpperCase()}${f.slice(1)} (${f === 'online' ? onlineCount : withLocation.length - onlineCount})`}
                color={f === 'all' ? AppColors.primary : f === 'online' ? AppColors.statusOnline : AppColors.textSecondary}
                selected={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search rider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: AppColors.textSecondary }} /></InputAdornment> }}
            />
            <IconButton size="small" onClick={(e) => setFilterMenuAnchor(e.currentTarget)} sx={{ border: `1px solid ${AppColors.border}`, borderRadius: '8px' }}>
              <FilterListIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
            </IconButton>
            <Menu anchorEl={filterMenuAnchor} open={Boolean(filterMenuAnchor)} onClose={() => setFilterMenuAnchor(null)}>
              <MenuItem onClick={() => { setFilter('all'); setFilterMenuAnchor(null); }}>All riders</MenuItem>
              <MenuItem onClick={() => { setFilter('online'); setFilterMenuAnchor(null); }}>Online only</MenuItem>
              <MenuItem onClick={() => { setFilter('offline'); setFilterMenuAnchor(null); }}>Offline only</MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {panelList.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1 }}>
              <LocationOffIcon sx={{ fontSize: 38, color: `${AppColors.textSecondary}59` }} />
              <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>No rider locations available</Typography>
            </Box>
          ) : (
            panelList.map((rider) => (
              <RiderRow key={rider.uid} rider={rider} isSelected={rider.uid === selectedId} isOnline={presence.isRiderOnline(rider)} onClick={() => selectRider(rider)} />
            ))
          )}
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: AppColors.infoLight, border: `1px solid ${AppColors.info}33`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ p: 0.75, borderRadius: '50%', bgcolor: AppColors.info, display: 'flex' }}>
              <WifiTetheringIcon sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Real-time Updates</Typography>
              <Typography sx={{ fontSize: 10, color: AppColors.textSecondary }}>Rider locations update automatically</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Selected rider card */}
      {selected && (
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: narrow ? 16 : 286, p: 2, borderRadius: '16px', bgcolor: AppColors.surface, boxShadow: 4, border: `1px solid ${AppColors.divider}`, zIndex: 1000 }}>
          <SelectedRiderCard rider={selected} isOnline={presence.isRiderOnline(selected)} onClose={() => setSelectedId(null)} onViewProfile={() => navigate(`/riders/${selected.uid}`)} />
        </Box>
      )}
    </Box>
  );
}

function MiniStat({ icon: Icon, dot, color, value, subtitle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1.25, borderRadius: '12px', bgcolor: AppColors.surface, boxShadow: 2, flexShrink: 0 }}>
      {dot ? (
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
      ) : (
        <Box sx={{ p: 0.75, borderRadius: '50%', bgcolor: AppColors.background, display: 'flex' }}>
          <Icon sx={{ fontSize: 15, color: AppColors.textSecondary }} />
        </Box>
      )}
      <Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</Typography>
        <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary, whiteSpace: 'nowrap' }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
}

function LegendRow({ label, count, color }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ flex: 1, fontSize: 12.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{count}</Typography>
    </Box>
  );
}

function FilterPill({ label, color, selected, onClick }) {
  return (
    <Box onClick={onClick} sx={{ px: 1.25, py: 0.6, borderRadius: '20px', cursor: 'pointer', bgcolor: selected ? color : AppColors.background, border: `1px solid ${selected ? color : AppColors.border}` }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: selected ? '#fff' : AppColors.textSecondary }}>{label}</Typography>
    </Box>
  );
}

function RiderRow({ rider, isSelected, isOnline, onClick }) {
  const statusColor = isOnline ? AppColors.statusOnline : AppColors.info;
  const avatarColor = markerColorFor(rider);
  const address = readableAddressFor(rider.latitude, rider.longitude);
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.75,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: isSelected ? `${AppColors.primary}12` : 'transparent',
        borderLeft: `3px solid ${isSelected ? AppColors.primary : 'transparent'}`,
        borderBottom: `1px solid ${AppColors.divider}`,
      }}
    >
      <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: `${avatarColor}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 700, color: avatarColor, fontSize: 15 }}>{rider.fullName ? rider.fullName[0].toUpperCase() : '?'}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rider.fullName}</Typography>
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: '10px', bgcolor: `${statusColor}1F` }}>
            <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: statusColor }}>{isOnline ? 'Online' : 'Located'}</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rider.vehicleType} • {rider.plateNumber}</Typography>
        <Typography sx={{ fontSize: 11, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</Typography>
      </Box>
      <GpsFixedIcon sx={{ fontSize: 14, color: isSelected ? AppColors.primary : AppColors.textSecondary, mt: 0.5, flexShrink: 0 }} />
    </Box>
  );
}

function SelectedRiderCard({ rider, isOnline, onClose, onViewProfile }) {
  const statusColor = isOnline ? AppColors.statusOnline : AppColors.statusOffline;
  const address = readableAddressFor(rider.latitude, rider.longitude);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: statusColor, border: `2.5px solid ${AppColors.surface}`, boxShadow: `0 0 8px ${statusColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{rider.fullName ? rider.fullName[0].toUpperCase() : '?'}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rider.fullName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColor }} />
            <Typography sx={{ fontSize: 12, color: statusColor, fontWeight: 500 }}>{isOnline ? 'Online' : 'Offline'}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
        </IconButton>
      </Box>
      <Box sx={{ borderTop: `1px solid ${AppColors.divider}`, mt: 1.5, pt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <InfoRow icon={PhoneOutlinedIcon} text={rider.phoneNumber} />
        <InfoRow icon={TwoWheelerIcon} text={`${rider.plateNumber}  ·  ${rider.motorcycleBrand} ${rider.motorcycleModel}`} />
        <InfoRow icon={PlaceOutlinedIcon} text={address} />
        <InfoRow icon={LocationOnOutlinedIcon} text={`${rider.latitude.toFixed(5)}, ${rider.longitude.toFixed(5)}`} />
      </Box>
      <Button fullWidth variant="outlined" startIcon={<PersonOutlinedIcon />} onClick={onViewProfile} sx={{ mt: 1.75, color: AppColors.primary, borderColor: AppColors.primary }}>
        View Profile
      </Button>
    </Box>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Icon sx={{ fontSize: 14, color: AppColors.textSecondary, mt: 0.15 }} />
      <Typography sx={{ fontSize: 12.5 }}>{text}</Typography>
    </Box>
  );
}
