import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Fade,
  Slide,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import { AppColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { AuthStatus } from '../../context/AuthContext';
import { emailValidator } from '../../utils/validators';

// Mirrors lib/screens/auth/login_screen.dart
export default function LoginScreen() {
  const auth = useAuth();
  const navigate = useNavigate();
  const isWide = useMediaQuery('(min-width:800px)');
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [obscurePassword, setObscurePassword] = useState(true);
  const [snackbar, setSnackbar] = useState(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => setVisible(true), []);

  // auth.signIn() resolves before this component re-renders with the new
  // errorMessage, so reading auth.errorMessage right after await would see a
  // stale (pre-update) closure value — react to the state change instead.
  useEffect(() => {
    if (auth.status === AuthStatus.error && auth.errorMessage) {
      setSnackbar({ severity: 'error', message: auth.errorMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, auth.errorMessage]);

  const isLoading = auth.status === AuthStatus.loading;

  const handleLogin = async () => {
    const err = emailValidator(email);
    setEmailError(err);
    if (err) return;
    auth.clearError();
    await auth.signIn(email.trim(), password.trim());
  };

  const featureItem = (Icon, text) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex',
        }}
      >
        <Icon sx={{ color: '#fff', fontSize: 16 }} />
      </Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{text}</Typography>
    </Box>
  );

  const loginCard = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.22), 0 10px 60px rgba(21,101,192,0.12)',
      }}
    >
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${AppColors.primaryDark}, ${AppColors.primary}, ${AppColors.secondary})` }} />
      <Box sx={{ p: { xs: 3, sm: 4.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(21,101,192,0.08)', display: 'flex' }}>
            <AdminPanelSettingsIcon sx={{ color: AppColors.primary, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: AppColors.textPrimary }}>
              Admin Login
            </Typography>
            <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>
              Authorized personnel only
            </Typography>
          </Box>
        </Box>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: AppColors.textPrimary, mb: 1 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="admin@vluerides.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            error={Boolean(emailError)}
            helperText={emailError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5 }}
          />

          <Typography sx={{ fontSize: 13, fontWeight: 600, color: AppColors.textPrimary, mb: 1 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type={obscurePassword ? 'password' : 'text'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setObscurePassword((v) => !v)} edge="end" size="small">
                    {obscurePassword ? (
                      <VisibilityOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Button
              onClick={() => setForgotOpen(true)}
              sx={{ fontSize: 12.5, color: AppColors.primary, textTransform: 'none', minWidth: 0, p: 0.5 }}
            >
              Forgot password?
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            variant="contained"
            sx={{ mt: 1.5, height: 52, fontSize: 15, fontWeight: 700, letterSpacing: 0 }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'SIGN IN'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: AppColors.warningLight,
              }}
            >
              <SecurityIcon sx={{ fontSize: 14, color: AppColors.warning }} />
              <Typography sx={{ fontSize: 11, color: AppColors.warning, fontWeight: 500 }}>
                Secure Admin Access Only
              </Typography>
            </Box>
          </Box>
        </form>
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #06101F 0%, #0D47A1 55%, #1565C0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ position: 'absolute', top: 16, left: 16, color: '#fff', textTransform: 'none' }}
      >
        Back to home
      </Button>
      <Fade in={visible} timeout={800}>
        <Slide in={visible} direction="up" timeout={600}>
          <Box sx={{ maxWidth: isWide ? 1100 : 460, width: '100%' }}>
            {isWide ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Box sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src="/vluerides-logo.png"
                      alt="VlueRides logo"
                      sx={{ width: 64, height: 64, borderRadius: 2, display: 'block', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}
                    />
                    <Box>
                      <Typography sx={{ color: '#fff', fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>
                        VLUE RIDES
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                        Admin Management System
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, mt: 6 }}>
                    Trento, Agusan del Sur
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 300, mt: 1, mb: 4 }}>
                    Manage local delivery operations
                    <br />
                    with clarity and control.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {featureItem(PeopleAltOutlinedIcon, 'Manage Customers & Riders')}
                    {featureItem(StoreOutlinedIcon, 'Monitor Food & Pabili Stores')}
                    {featureItem(MapOutlinedIcon, 'Live Rider Tracking')}
                    {featureItem(AnalyticsOutlinedIcon, 'Revenue Reports & Analytics')}
                  </Box>
                </Box>
                <Box sx={{ width: 440 }}>{loginCard}</Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src="/vluerides-logo.png"
                  alt="VlueRides logo"
                  sx={{ width: 80, height: 80, borderRadius: 2, display: 'block', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}
                />
                <Typography sx={{ color: '#fff', fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>
                  VLUE RIDES
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, mb: 2 }}>
                  Admin Panel
                </Typography>
                <Box sx={{ width: '100%' }}>{loginCard}</Box>
              </Box>
            )}
          </Box>
        </Slide>
      </Fade>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar && (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        )}
      </Snackbar>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} initialEmail={email} />
    </Box>
  );
}

function ForgotPasswordDialog({ open, onClose, initialEmail }) {
  const auth = useAuth();
  const [resetEmail, setResetEmail] = useState(initialEmail || '');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (open) {
      setResetEmail(initialEmail || '');
      setError(null);
    }
  }, [open, initialEmail]);

  const handleSend = async () => {
    const err = emailValidator(resetEmail);
    setError(err);
    if (err) return;
    setSending(true);
    try {
      await auth.sendPasswordReset(resetEmail.trim());
      onClose();
      setSnackbar('If that email has an admin account, a reset link has been sent.');
    } catch (e) {
      setSending(false);
      setError((e?.message || String(e)).replace(/^Exception: /, ''));
    }
  };

  return (
    <>
      <Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mb: 2 }}>
            Enter your admin account&apos;s email and we&apos;ll send a password reset link to it.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            type="email"
            label="Email Address"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} variant="contained">
            {sending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(null)} sx={{ borderRadius: 2 }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
}
