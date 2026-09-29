import { useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Button, ButtonBase } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RouteIcon from '@mui/icons-material/Route';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { AppColors } from '../../theme/colors';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/appUtils';
import Sparkline from '../../components/Sparkline';
import DonutCard from '../../components/DonutCard';

// Mirrors lib/screens/dashboard/dashboard_screen.dart
export default function DashboardScreen() {
  const dash = useDashboard();

  useEffect(() => {
    dash.loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dash.isLoading && Object.keys(dash.stats).length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 10 }}>
        <CircularProgress sx={{ color: AppColors.primary }} />
      </Box>
    );
  }

  if (dash.error && Object.keys(dash.stats).length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 1.5 }}>
        <ErrorOutlineIcon sx={{ color: AppColors.error, fontSize: 48 }} />
        <Typography sx={{ color: AppColors.textSecondary, fontSize: 15 }}>Failed to load dashboard</Typography>
        <Button variant="outlined" onClick={dash.refresh}>
          Retry
        </Button>
      </Box>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dash.totalRevenue),
      icon: AttachMoneyIcon,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      subtitle: 'Sum of all delivery fees',
    },
    {
      title: 'Total Deliveries',
      value: String(dash.totalDeliveries),
      icon: LocalShippingOutlinedIcon,
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      subtitle: 'Delivered + Completed',
    },
    {
      title: 'Active Rides',
      value: String(dash.activeRides),
      icon: DirectionsBikeIcon,
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      subtitle: 'Currently in progress',
    },
    {
      title: 'Online Riders',
      value: String(dash.onlineRiders),
      icon: DeliveryDiningIcon,
      iconBg: '#ECFEFF',
      iconColor: '#0891B2',
      subtitle: 'Available right now',
    },
    {
      title: 'Total Customers',
      value: String(dash.totalCustomers),
      icon: PeopleAltIcon,
      iconBg: '#EFF6FF',
      iconColor: '#1D4ED8',
      subtitle: 'Registered users',
    },
    {
      title: 'Pending Approvals',
      value: String(dash.pendingApprovals),
      icon: PendingActionsIcon,
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      subtitle: 'Riders awaiting paperwork review',
    },
    {
      title: 'Awaiting Office Visit',
      value: String(dash.awaitingOfficeVisit),
      icon: FactCheckOutlinedIcon,
      iconBg: '#F0F9FF',
      iconColor: '#0288D1',
      subtitle: 'Riders asked to bring documents',
    },
    {
      title: 'Avg Rating',
      value: dash.avgRating > 0 ? `${dash.avgRating.toFixed(1)} ★` : '—',
      icon: StarOutlineIcon,
      iconBg: '#F8FAFC',
      iconColor: '#64748B',
      subtitle: 'Customer ratings',
    },
    {
      title: 'Cancellation Rate',
      value: `${dash.cancellationRate.toFixed(1)}%`,
      icon: CancelOutlinedIcon,
      iconBg: '#FFF1F2',
      iconColor: '#E11D48',
      subtitle: 'Of all orders',
    },
  ];

  const riderSegments = [
    { name: 'Online Riders', value: dash.onlineRiders, color: AppColors.success, valueStr: String(dash.onlineRiders) },
    { name: 'Pending Approval', value: dash.pendingApprovals, color: AppColors.warning, valueStr: String(dash.pendingApprovals) },
    { name: 'Awaiting Office Visit', value: dash.awaitingOfficeVisit, color: AppColors.info, valueStr: String(dash.awaitingOfficeVisit) },
    { name: 'Active Rides', value: dash.activeRides, color: '#2563EB', valueStr: String(dash.activeRides) },
  ];
  const riderTotal = dash.onlineRiders + dash.pendingApprovals + dash.awaitingOfficeVisit + dash.activeRides;

  const countTotal = dash.totalDeliveries + dash.activeRides;
  const cancelWeight = dash.cancellationRate > 0 ? Math.max(countTotal * 0.15, 0.4) : 0.0;
  const orderSegments = [
    { name: 'Total Deliveries', value: dash.totalDeliveries, color: '#2563EB', valueStr: String(dash.totalDeliveries) },
    { name: 'Active Rides', value: dash.activeRides, color: AppColors.info, valueStr: String(dash.activeRides) },
    { name: 'Cancellation Rate', value: cancelWeight, color: AppColors.error, valueStr: `${dash.cancellationRate.toFixed(1)}%` },
  ];

  return (
    <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #1E50DA 0%, #2563EB 55%, #1E8FCF 100%)',
          borderRadius: '14px',
          boxShadow: '0 8px 18px rgba(37,99,235,0.25)',
          p: { xs: 2, sm: '22px 22px 22px 26px' },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <RouteIcon sx={{ color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Operations Dashboard</Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <ButtonBase
          onClick={dash.refresh}
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            bgcolor: 'rgba(255,255,255,0.16)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <RefreshIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 13.5 }}>Refresh</Typography>
        </ButtonBase>
      </Box>

      {/* KPI Grid */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {kpiCards.map((d) => (
          <Grid item xs={6} sm={4} md={3} key={d.title}>
            <Box
              sx={{
                p: '16px 16px 12px',
                borderRadius: '14px',
                bgcolor: AppColors.surface,
                border: `1px solid ${AppColors.divider}`,
                boxShadow: `0 6px 14px ${AppColors.shadow}`,
                height: 140,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 24px ${AppColors.shadow}`,
                  borderColor: `${d.iconColor}55`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    p: 1.1,
                    borderRadius: '10px',
                    bgcolor: d.iconBg,
                    display: 'flex',
                  }}
                >
                  <d.icon sx={{ color: d.iconColor, fontSize: 18 }} />
                </Box>
                <Typography
                  sx={{
                    color: AppColors.textSecondary,
                    fontSize: 12.5,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.title}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: AppColors.textPrimary,
                      fontSize: 24,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.value}
                  </Typography>
                  <Typography
                    sx={{
                      color: AppColors.textSecondary,
                      fontSize: 10.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.subtitle}
                  </Typography>
                </Box>
                <Sparkline color={d.iconColor} />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Donut overview row */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <DonutCard
            title="Rider Overview"
            subtitle="Overview of rider status"
            icon={GroupsOutlinedIcon}
            accent="#2563EB"
            segments={riderSegments}
            centerValue={riderTotal}
            centerLabel="Total Riders"
            bannerIcon={InfoOutlineIcon}
            bannerColor={AppColors.info}
            bannerTitle="Keep track of your rider network"
            bannerSubtitle="Real-time overview of all rider statuses"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DonutCard
            title="Delivery Overview"
            subtitle="Delivery performance summary"
            icon={LocalShippingOutlinedIcon}
            accent="#2563EB"
            segments={orderSegments}
            centerValue={countTotal}
            centerLabel="Total Deliveries"
            bannerIcon={CheckCircleOutlineIcon}
            bannerColor={AppColors.success}
            bannerTitle="Monitor delivery performance"
            bannerSubtitle="Track success rate and completion metrics"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
