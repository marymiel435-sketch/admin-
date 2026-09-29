import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthService } from '../../services/authService';
import { EmailOtpService } from '../../services/emailOtpService';
import { StorageService } from '../../services/storageService';
import { StoreService } from '../../services/storeService';
import { composeTrentoAddress } from '../../utils/address';
import { BillTypes, StoreCategories } from '../../utils/constants';
import { Validators } from '../../utils/validators';
import AuthShowcasePanel from '../../widgets/common/AuthShowcasePanel';
import BrandHeader from '../../widgets/common/BrandHeader';
import FormSectionHeader from '../../widgets/common/FormSectionHeader';
import ResponsiveFieldRow from '../../widgets/common/ResponsiveFieldRow';
import ImageUploadField from '../../widgets/imageUpload/ImageUploadField';
import LocationPinField from '../../widgets/locationPicker/LocationPinField';

function MessageBanner({ text, color, background, icon: Icon }) {
  return (
    <Box p={1.5} borderRadius={1.5} display="flex" alignItems="flex-start" sx={{ bgcolor: background }}>
      <Icon fontSize="small" sx={{ color, mr: 1.25 }} />
      <Typography variant="body2" sx={{ color, whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </Box>
  );
}

const REGISTER_FEATURES = [
  { icon: StorefrontOutlinedIcon, text: 'Set up your storefront in minutes' },
  { icon: BadgeOutlinedIcon, text: 'Get verified and go live to customers' },
  { icon: PlaceOutlinedIcon, text: 'Reach riders and shoppers across Trento' },
];

export default function RegisterScreen() {
  const navigate = useNavigate();
  const showShowcase = useMediaQuery('(min-width:900px)');

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  const [category, setCategory] = useState(StoreCategories.list[0]);
  const [billType, setBillType] = useState('');
  const [pabiliCategory, setPabiliCategory] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null, barangay: null, purok: null });
  const [permitFile, setPermitFile] = useState(null);
  const [permitContentType, setPermitContentType] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [pabiliCategoryOptions, setPabiliCategoryOptions] = useState([]);
  const [loadingPabiliCategories, setLoadingPabiliCategories] = useState(true);

  // Email verification — mirrors the vlue-rides mobile app's registration
  // flow: no Firebase Auth account is created until the applicant proves
  // they own this address via a 6-digit emailed code. `pendingId` names the
  // pending_registrations doc the sendEmailOtp/verifyEmailOtp Cloud
  // Functions manage (see emailOtpService.js); it's re-checked right before
  // signUp in submit() rather than trusted from this state alone.
  const [pendingId, setPendingId] = useState(null);
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const cooldownTimerRef = useRef(null);

  const emailVerified = verifiedEmail != null && verifiedEmail === email.trim();

  useEffect(() => () => clearInterval(cooldownTimerRef.current), []);

  const startResendCooldown = () => {
    clearInterval(cooldownTimerRef.current);
    setResendSecondsLeft(60);
    cooldownTimerRef.current = setInterval(() => {
      setResendSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Editing the email after a code was sent/verified invalidates that
  // session — the pending doc belongs to the old address.
  const handleEmailChange = (value) => {
    setEmail(value);
    setOtpError(null);
    if (pendingId != null || verifiedEmail != null) {
      setPendingId(null);
      setVerifiedEmail(null);
      setOtpSent(false);
      setOtpCode('');
      clearInterval(cooldownTimerRef.current);
      setResendSecondsLeft(0);
    }
  };

  const handleSendCode = async () => {
    const emailErr = Validators.email(email);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }
    setSendingOtp(true);
    setOtpError(null);
    try {
      const newPendingId = await EmailOtpService.sendCode({
        email: email.trim(),
        pendingId: pendingId ?? undefined,
      });
      setPendingId(newPendingId);
      setOtpSent(true);
      startResendCooldown();
    } catch (e) {
      setOtpError(e.message ?? 'Could not send the verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6 || pendingId == null) return;
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const verified = await EmailOtpService.verifyCode({ pendingId, code: otpCode });
      if (!verified) {
        setOtpError('Incorrect code. Please try again.');
        return;
      }
      setVerifiedEmail(email.trim());
      setOtpCode('');
    } catch (e) {
      setOtpError(e.message ?? 'Incorrect code. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const isBiller = category === StoreCategories.bills;
  const isPabili = category === StoreCategories.pabili;

  // Fetched eagerly (regardless of the initially selected Store Type) so
  // the dropdown is ready the moment the applicant switches to Pabili
  // Store, rather than flashing a loading state on every toggle. Reads
  // app_config/pabili_categories, which is public-read specifically
  // because this runs before the applicant is signed in.
  useEffect(() => {
    StoreService.fetchPabiliCategories()
      .then((categories) => {
        setPabiliCategoryOptions(categories);
        setLoadingPabiliCategories(false);
      })
      .catch((e) => {
        console.debug('Failed to load Pabili categories:', e);
        setLoadingPabiliCategories(false);
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const errors = {
      storeName: Validators.required(storeName, 'Store name'),
      billType: isBiller ? Validators.required(billType, 'Bill type') : null,
      pabiliCategory:
        isPabili && pabiliCategoryOptions.length > 0 ? Validators.required(pabiliCategory, 'Pabili category') : null,
      ownerName: Validators.required(ownerName, 'Owner name'),
      phone: Validators.phone(phone),
      email: Validators.email(email),
      password: Validators.password(password),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (location.latitude == null || location.longitude == null || !location.purok) {
      setError('Please select your purok location below.');
      return;
    }
    if (!emailVerified || pendingId == null) {
      setError('Please verify your email address before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setWarning(null);

    try {
      // Re-check the pending registration rather than trusting emailVerified
      // alone — it could have expired since the code was confirmed. Only
      // after this is a real Firebase Auth account created; an unverified
      // email is never stored in Authentication.
      const pending = await EmailOtpService.checkPending(pendingId);
      if (!pending.exists || !pending.confirmed) {
        throw new Error('Your email is no longer verified. Please verify it again.');
      }

      // Best-effort: clear out a leftover Auth account with no matching
      // store doc (e.g. an abandoned attempt) so it never blocks this
      // signup with email-already-in-use.
      try {
        await EmailOtpService.reclaimIfAbandoned(email.trim());
      } catch {
        // If this fails, signUp below will surface whatever the real
        // problem is.
      }

      const credential = await AuthService.signUp({ email: email.trim(), password });
      const uid = credential.user.uid;

      // Try the permit photo upload first, while we're still safely on
      // this screen — createStore() below is what triggers the redirect
      // to /pending the instant it succeeds, so anything that needs to
      // show feedback to the owner must happen before that call, not
      // after it (a warning set after createStore() can lose the race
      // against navigation and never actually be seen).
      let permitPhotoUrl;
      if (permitFile != null) {
        try {
          permitPhotoUrl = await StorageService.uploadPermitPhoto({ uid, bytes: permitFile, contentType: permitContentType });
        } catch (e) {
          // Non-fatal — the application must still be saved even if the
          // optional permit photo fails to upload.
          console.debug('Permit photo upload failed:', e);
          setWarning(
            "Your permit photo couldn't be uploaded, so your application will be submitted without it. You can add it later if your application is rejected.\n\nDetails: " +
              e
          );
        }
      }

      // The application itself is the write the admin needs to see, and
      // must never depend on the optional permit photo succeeding.
      await StoreService.createStore({
        uid,
        storeName: storeName.trim(),
        category,
        billType: isBiller ? billType : null,
        pabiliCategory: isPabili ? pabiliCategory : null,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: composeTrentoAddress({ purok: location.purok, barangay: location.barangay, details: addressDetails }),
        barangay: location.barangay,
        purok: location.purok,
        latitude: location.latitude,
        longitude: location.longitude,
        permitPhotoUrl,
      });
      // The router's redirect sends the now-authenticated, Pending-status
      // owner to /pending automatically once the store doc streams in.
    } catch (e) {
      setError(e.message ?? `Something went wrong: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Same fixed-height/internal-scroll split as LoginScreen: on desktop the
    // blue showcase panel is pinned for the full viewport height and only
    // this (much longer) form column scrolls — the panel never scrolls away.
    <Box display="flex" sx={showShowcase ? { height: '100vh' } : { minHeight: '100vh' }}>
      {showShowcase && (
        <Box flex={5}>
          <AuthShowcasePanel
            heading={
              <>
                List your products,
                <br />
                reach more customers.
              </>
            }
            description="Register your store in a few steps and start showing up to customers and riders across Trento, Agusan del Sur."
            features={REGISTER_FEATURES}
          />
        </Box>
      )}
      <Box
        flex={6}
        display="flex"
        justifyContent="center"
        px={2}
        py={5}
        sx={showShowcase ? { height: '100%', overflowY: 'auto' } : undefined}
      >
      <Box maxWidth={680} width="100%">
        {!showShowcase && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <BrandHeader subtitle="Register your store — Trento, Agusan del Sur" />
          </Box>
        )}
        <Box height={28} />
        <Card>
          <Box p={3.5} component="form" onSubmit={submit} display="flex" flexDirection="column" gap={2}>
            <FormSectionHeader icon={StorefrontOutlinedIcon} title="Store Details" />
            <TextField
              fullWidth
              label="Store / Business Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              error={Boolean(fieldErrors.storeName)}
              helperText={fieldErrors.storeName ?? ' '}
            />
            <ResponsiveFieldRow>
              <TextField select fullWidth label="Store Type" value={category} onChange={(e) => setCategory(e.target.value)}>
                {StoreCategories.list.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              {isBiller ? (
                <TextField
                  select
                  fullWidth
                  label="Bill Type"
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                  error={Boolean(fieldErrors.billType)}
                  helperText={fieldErrors.billType ?? ' '}
                >
                  {BillTypes.list.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </TextField>
              ) : isPabili ? (
                <TextField
                  select
                  fullWidth
                  label="Pabili Category"
                  value={pabiliCategory}
                  onChange={(e) => setPabiliCategory(e.target.value)}
                  disabled={loadingPabiliCategories || pabiliCategoryOptions.length === 0}
                  error={Boolean(fieldErrors.pabiliCategory)}
                  helperText={
                    fieldErrors.pabiliCategory ??
                    (loadingPabiliCategories ? 'Loading…' : pabiliCategoryOptions.length === 0 ? 'None configured' : ' ')
                  }
                >
                  {pabiliCategoryOptions.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Box />
              )}
            </ResponsiveFieldRow>

            <Divider sx={{ my: 1 }} />
            <FormSectionHeader icon={PersonOutlineIcon} title="Owner & Account" />
            <ResponsiveFieldRow>
              <TextField
                fullWidth
                label="Owner Full Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                error={Boolean(fieldErrors.ownerName)}
                helperText={fieldErrors.ownerName ?? ' '}
              />
              <TextField
                fullWidth
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone ?? ' '}
              />
            </ResponsiveFieldRow>
            <Box display="flex" gap={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                error={Boolean(fieldErrors.email) || Boolean(!otpSent && otpError)}
                helperText={fieldErrors.email ?? (!otpSent && otpError) ?? (emailVerified ? 'Verified' : ' ')}
                disabled={sendingOtp || verifyingOtp}
                InputProps={{
                  readOnly: emailVerified,
                  endAdornment: emailVerified ? (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" fontSize="small" />
                    </InputAdornment>
                  ) : undefined,
                }}
              />
              {!emailVerified && (
                <Button
                  variant="outlined"
                  sx={{ mt: 0.25, whiteSpace: 'nowrap' }}
                  disabled={sendingOtp || !email.trim() || resendSecondsLeft > 0}
                  onClick={handleSendCode}
                >
                  {sendingOtp ? (
                    <CircularProgress size={18} />
                  ) : resendSecondsLeft > 0 ? (
                    `Resend (${resendSecondsLeft}s)`
                  ) : otpSent ? (
                    'Resend Code'
                  ) : (
                    'Send Code'
                  )}
                </Button>
              )}
            </Box>
            {otpSent && !emailVerified && (
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <TextField
                  fullWidth
                  label="6-Digit Verification Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={Boolean(otpError)}
                  helperText={otpError ?? `We emailed a code to ${email.trim()}`}
                />
                <Button
                  variant="contained"
                  sx={{ mt: 0.25, whiteSpace: 'nowrap' }}
                  disabled={otpCode.length !== 6 || verifyingOtp}
                  onClick={handleVerifyCode}
                >
                  {verifyingOtp ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Verify'}
                </Button>
              </Box>
            )}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password ?? ' '}
            />

            <Divider sx={{ my: 1 }} />
            <FormSectionHeader icon={PlaceOutlinedIcon} title="Business Location" />
            <LocationPinField
              onLocationSelected={(lat, lng, barangay, purok) => setLocation({ latitude: lat, longitude: lng, barangay, purok })}
            />
            <TextField
              fullWidth
              label="Landmark / Additional Address Details (optional)"
              placeholder="e.g. beside the chapel, Zone 3"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
            />

            <Divider sx={{ my: 1 }} />
            <FormSectionHeader icon={BadgeOutlinedIcon} title="Verification (optional)" />
            <ImageUploadField
              label="Business Permit / Valid ID"
              onImageSelected={(file, contentType) => {
                setPermitFile(file);
                setPermitContentType(contentType);
              }}
            />

            {error && <MessageBanner text={error} color="error.main" background="error.light" icon={ErrorOutlineIcon} />}
            {warning && (
              <MessageBanner text={warning} color="#7a4a00" background="#fff3e0" icon={WarningAmberOutlinedIcon} />
            )}

            <Button type="submit" fullWidth variant="contained" disabled={submitting || !emailVerified} sx={{ mt: 1 }}>
              {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : !emailVerified ? 'Verify Your Email to Continue' : 'Submit Application'}
            </Button>
          </Box>
        </Card>
        <Box height={16} />
        <Box display="flex" justifyContent="center">
          <Button
            onClick={async () => {
              // Signed in without a store doc is what lands someone here
              // unasked — sign out first so the login form is usable.
              if (AuthService.currentUser) await AuthService.signOut();
              navigate('/login');
            }}
          >
            Already have a store account? Sign in
          </Button>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
