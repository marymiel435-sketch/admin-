import BlockIcon from '@mui/icons-material/Block';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { AuthService } from '../../services/authService';
import BrandHeader from '../../widgets/common/BrandHeader';

export default function SuspendedScreen() {
  return (
    <Box minHeight="100vh">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6" fontWeight={700}>
            Account Suspended
          </Typography>
          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={() => AuthService.signOut()}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box display="flex" justifyContent="center" px={3} py={6}>
        <Box maxWidth={480} display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <BrandHeader />
          <Box height={24} />
          <BlockIcon sx={{ fontSize: 64, color: 'error.main' }} />
          <Box height={16} />
          <Typography variant="h5">Your account has been suspended</Typography>
          <Box height={12} />
          <Typography variant="body2">
            Your store listing is currently hidden and the dashboard is locked. Please contact support if you
            believe this is a mistake.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
