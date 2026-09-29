import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { STORE_PORTAL_URL } from '../landing/PublicLayout';

// /login/store — stores sign in on the separate store portal, so this route
// just forwards there (keeps old or bookmarked links working).
export default function StoreLoginScreen() {
  useEffect(() => {
    window.location.replace(STORE_PORTAL_URL);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: '#F6F9FF' }}>
      <CircularProgress sx={{ color: '#1565C0' }} />
      <Typography sx={{ color: '#475569', fontSize: 15 }}>Opening the store portal…</Typography>
    </Box>
  );
}
