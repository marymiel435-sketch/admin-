import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { auth } from '../../firebase';
import { AuthService } from '../../services/authService';
import { StoreService } from '../../services/storeService';
import BrandHeader from '../../widgets/common/BrandHeader';

export default function PendingReviewScreen() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser.uid;
    return StoreService.streamStore(uid, setStore);
  }, []);

  return (
    <Box minHeight="100vh">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6" fontWeight={700}>
            Application Under Review
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
          <HourglassTopIcon sx={{ fontSize: 64, color: 'orange' }} />
          <Box height={16} />
          <Typography variant="h5">Your application is under review</Typography>
          <Box height={12} />
          <Typography variant="body2">
            {`Thanks for registering${store ? ` "${store.storeName}"` : ''}. We're reviewing your submission and will notify you here as soon as it's approved. This page updates automatically — no need to refresh.`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
