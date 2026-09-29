import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthService } from '../../services/authService';
import { StoreService } from '../../services/storeService';
import { Validators } from '../../utils/validators';
import AuthShowcasePanel, { DecorCircle } from '../../widgets/common/AuthShowcasePanel';

// This Firebase project has email-enumeration protection enabled, so a
// wrong password and an unregistered email both come back from Firebase
// as the same generic code — there's no way to tell them apart
// client-side, so both are shown as one combined message rather than a
// misleadingly specific one.
function loginErrorMessage(e) {
  switch (e.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password, or this account isn\'t registered yet. If you\'re new here, tap "Create one" below.';
    case 'auth/invalid-email':
      return "That email address doesn't look valid.";
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return e.message ?? 'Sign in failed';
  }
}

// Shared "filled" look for the email/password fields: a soft tinted
// background that lifts to white with a brand-colored glow on focus,
// instead of the app-wide plain outlined style — this screen is the
// storefront's front door, so it gets a little more visual polish.
function fieldSx(primary) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      backgroundColor: '#F5F7FB',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'transparent' },
      '&.Mui-focused': { backgroundColor: '#fff', boxShadow: `0 0 0 4px ${primary}1F` },
      '&.Mui-focused fieldset': { borderColor: primary },
    },
  };
}

export default function LoginScreen() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const showShowcase = useMediaQuery('(min-width:900px)');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const eErr = Validators.email(email);
    const pErr = password === '' ? 'Password is required' : null;
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const cred = await AuthService.signIn({ email: email.trim(), password });
      // A valid login with no store doc (a rider/customer/admin account, or
      // an unfinished registration) — sign back out and say so, rather than
      // leaving them signed in on a registration form they didn't ask for.
      if ((await StoreService.getStore(cred.user.uid)) == null) {
        await AuthService.signOut();
        setError('No store account found for this email. Register your store below, or sign in with a different account.');
        return;
      }
      // The router's redirect picks up the auth state change automatically.
    } catch (e) {
      setError(loginErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const forgotPassword = async () => {
    const trimmed = email.trim();
    if (trimmed === '' || Validators.email(trimmed) != null) {
      setError('Enter your email above first, then tap "Forgot password?".');
      setInfo(null);
      return;
    }
    setError(null);
    setInfo(null);
    try {
      await AuthService.sendPasswordResetEmail(trimmed);
      setInfo(`Password reset email sent to ${trimmed}.`);
    } catch (e) {
      setError(e.message ?? 'Could not send reset email');
    }
  };

  return (
    // On desktop, the row is pinned to exactly the viewport height and only
    // the form column scrolls internally (overflowY: auto below) — the blue
    // showcase panel never scrolls out of view. On mobile there's no
    // showcase panel to protect, so the page just scrolls normally.
    <Box display="flex" sx={showShowcase ? { height: '100vh' } : { minHeight: '100vh' }}>
      {showShowcase && (
        <Box flex={5}>
          <AuthShowcasePanel />
        </Box>
      )}
      <Box
        flex={4}
        display="flex"
        flexDirection="column"
        px={3}
        py={5}
        position="relative"
        sx={{
          background: 'radial-gradient(circle at 85% 0%, #EAF1FC 0%, #F7F8FA 45%)',
          ...(showShowcase ? { height: '100%', overflowY: 'auto' } : { overflow: 'hidden' }),
        }}
      >
        {!showShowcase && (
          <>
            <DecorCircle size={220} color={`${primary}14`} sx={{ top: -90, right: -90 }} />
            <DecorCircle size={160} color="rgba(255,176,32,0.10)" sx={{ bottom: -60, left: -60 }} />
          </>
        )}
        <Fade in timeout={450}>
          {/* margin: 'auto' (not the parent's alignItems: 'center') centers
              this card both axes when it fits, but degrades to normal
              top-aligned, scrollable flow instead of clipping the top when
              it's taller than the viewport — align-items: center + overflow:
              auto famously clips the start of an overflowing flex child. */}
          <Box maxWidth={420} width="100%" position="relative" sx={{ margin: 'auto' }}>
            {!showShowcase && (
              <Box display="flex" flexDirection="column" alignItems="center" mb={3.5}>
                <Box
                  component="img"
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Vlue Rides"
                  sx={{ width: 64, height: 64, borderRadius: '50%', boxShadow: `0 10px 24px ${primary}40` }}
                />
                <Box height={12} />
                <Typography variant="h6" fontWeight={800} letterSpacing={0.2}>
                  Vlue Rides
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: '22px',
                boxShadow: '0 24px 60px -24px rgba(11,31,69,0.28)',
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 3, sm: 4.5 },
              }}
              component="form"
              onSubmit={submit}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 5,
                  bgcolor: 'primary.50',
                }}
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', letterSpacing: 0.4 }}>
                  STORE OWNER PORTAL
                </Typography>
              </Box>
              <Box height={16} />
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                Welcome back
              </Typography>
              <Box height={6} />
              <Typography variant="body2" color="text.secondary">
                Sign in to manage your store
              </Typography>
              <Box height={28} />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(emailError)}
                helperText={emailError ?? ' '}
                sx={fieldSx(primary)}
                InputProps={{ startAdornment: <MailOutlineIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} /> }}
              />
              <Box height={10} />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(passwordError)}
                helperText={passwordError ?? ' '}
                sx={fieldSx(primary)}
                InputProps={{ startAdornment: <LockOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} /> }}
              />
              <Box display="flex" justifyContent="flex-end" mt={-0.5}>
                <Button size="small" disabled={submitting} onClick={forgotPassword} sx={{ fontWeight: 600 }}>
                  Forgot password?
                </Button>
              </Box>
              {info && (
                <Box
                  mt={0.5}
                  mb={1}
                  p={1.5}
                  borderRadius={2.5}
                  display="flex"
                  alignItems="flex-start"
                  sx={{ bgcolor: 'secondary.light' }}
                >
                  <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1.25 }} />
                  <Typography variant="body2">{info}</Typography>
                </Box>
              )}
              {error && (
                <Box
                  mt={1}
                  mb={1}
                  p={1.5}
                  borderRadius={2.5}
                  display="flex"
                  alignItems="flex-start"
                  sx={{ bgcolor: 'error.light', color: 'error.dark' }}
                >
                  <ErrorOutlineIcon fontSize="small" sx={{ mr: 1.25 }} />
                  <Typography variant="body2">{error}</Typography>
                </Box>
              )}
              <Box height={18} />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                endIcon={!submitting && <ArrowForwardIcon fontSize="small" />}
                sx={{
                  py: 1.4,
                  fontSize: 15.5,
                  background: `linear-gradient(135deg, ${primary}, #3E8EF7)`,
                  boxShadow: `0 12px 24px -8px ${primary}66`,
                  '&:hover': { background: `linear-gradient(135deg, ${primary}, #3E8EF7)`, boxShadow: `0 14px 28px -8px ${primary}80` },
                }}
              >
                {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
              <Box height={22}>
                <Divider>
                  <Typography variant="caption" color="text.secondary">
                    NEW TO VLUE RIDES
                  </Typography>
                </Divider>
              </Box>
              <Box height={6} />
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{ py: 1.2 }}
              >
                Create a store account
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
