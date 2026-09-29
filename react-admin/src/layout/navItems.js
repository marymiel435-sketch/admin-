import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SosOutlinedIcon from '@mui/icons-material/SosOutlined';
import SosIcon from '@mui/icons-material/Sos';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MapIcon from '@mui/icons-material/Map';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import StoreIcon from '@mui/icons-material/Store';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

// Mirrors admin_layout.dart's _navItems + _screens (same order/paths/badges)
export const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon, activeIcon: DashboardIcon },
  { label: 'SOS', path: '/sos', icon: SosOutlinedIcon, activeIcon: SosIcon, badge: 'sos' },
  { label: 'Riders', path: '/riders', icon: DeliveryDiningOutlinedIcon, activeIcon: DeliveryDiningIcon, badge: 'riders' },
  { label: 'Live Tracking', path: '/tracking', icon: MapOutlinedIcon, activeIcon: MapIcon },
  { label: 'Customers', path: '/customers', icon: PeopleOutlinedIcon, activeIcon: PeopleIcon },
  { label: 'Transactions', path: '/orders', icon: ReceiptLongOutlinedIcon, activeIcon: ReceiptLongIcon },
  { label: 'Analytics', path: '/reports', icon: BarChartOutlinedIcon, activeIcon: BarChartIcon },
  { label: 'Stores', path: '/stores', icon: StoreOutlinedIcon, activeIcon: StoreIcon, badge: 'stores' },
  { label: 'Subscriptions', path: '/subscriptions', icon: WorkspacePremiumOutlinedIcon, activeIcon: WorkspacePremiumIcon, badge: 'subscriptions' },
  { label: 'Settings', path: '/settings', icon: SettingsOutlinedIcon, activeIcon: SettingsIcon },
];
