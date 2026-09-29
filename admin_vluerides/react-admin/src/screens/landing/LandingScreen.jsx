import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ShoppingBasketRoundedIcon from '@mui/icons-material/ShoppingBasketRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import DeliveryDiningRoundedIcon from '@mui/icons-material/DeliveryDiningRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import PublicLayout, {
  C,
  GRADIENT,
  Eyebrow,
  GradientText,
  HeroGlow,
  PhoneMockup,
  SectionHeading,
  ghostButtonSx,
  primaryButtonSx,
} from './PublicLayout';

const services = [
  {
    Icon: RestaurantRoundedIcon,
    color: '#F97316',
    title: 'Food Delivery',
    text: 'Order from local restaurants and food stalls in Trento and get your meal delivered hot to your door.',
  },
  {
    Icon: ShoppingBasketRoundedIcon,
    color: '#16A34A',
    title: 'Pabili',
    text: 'Groceries, medicine or supplies — our riders buy what you need from partner stores and bring it to you.',
  },
  {
    Icon: ReceiptLongRoundedIcon,
    color: '#7C3AED',
    title: 'Bills Payment',
    text: 'Skip the long lines. Let a VlueRides rider settle your bills for you, quickly and securely.',
  },
  {
    Icon: LocalShippingRoundedIcon,
    color: C.primary,
    title: 'Pickup & Drop-off',
    text: 'Send parcels, documents or items anywhere in Trento — a rider picks it up and drops it off for you.',
  },
];

const values = [
  { Icon: PlaceRoundedIcon, title: 'Proudly local', text: 'Built for the barangays and puroks of Trento, Agusan del Sur.' },
  { Icon: VerifiedUserRoundedIcon, title: 'Verified riders', text: 'Every rider is screened and verified in person at our office.' },
  { Icon: HandshakeRoundedIcon, title: 'Store partners', text: 'We help local businesses reach more customers online.' },
];

const steps = [
  { Icon: StorefrontRoundedIcon, title: 'Choose a store', text: 'Browse food and pabili stores near you.' },
  { Icon: ShoppingCartCheckoutRoundedIcon, title: 'Place your order', text: 'See the total and delivery fee before you confirm.' },
  { Icon: DeliveryDiningRoundedIcon, title: 'Track & receive', text: 'Watch your rider live — or get SMS updates if their signal drops.' },
];

const trackingFeatures = [
  {
    Icon: MyLocationRoundedIcon,
    title: 'Live GPS tracking',
    text: 'While your rider is online, follow them on the map in real time from pickup to your door.',
  },
  {
    Icon: SmsRoundedIcon,
    title: 'Offline SMS updates every 5 minutes',
    text: 'If the rider loses mobile data, VlueRides automatically texts you every 5 minutes with your order details and where the rider is — as a readable purok and barangay, no link to open.',
  },
  {
    Icon: SignalCellularConnectedNoInternet0BarRoundedIcon,
    title: 'Built for low-signal areas',
    text: "Weak data in some puroks and barangays doesn't leave you guessing — you stay updated until your order arrives.",
  },
];

const highlights = [
  { value: '4-in-1', label: 'Food, pabili, bills & pickup/drop-off' },
  { value: 'Live + SMS', label: 'Rider tracking, even offline' },
  { value: '100%', label: 'Verified riders' },
  { value: 'Local', label: 'Trento stores' },
];

export default function LandingScreen() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Arriving from another public page via /#about etc. — scroll to that section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  const goToDownload = () => {
    navigate('/download');
    window.scrollTo({ top: 0 });
  };

  return (
    <PublicLayout>
      {/* Home / hero */}
      <Box id="home" sx={{ position: 'relative', scrollMarginTop: 72, pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <HeroGlow />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
              gap: { xs: 6, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Eyebrow>Now serving Trento, Agusan del Sur</Eyebrow>
              <Typography
                component="h1"
                sx={{
                  color: C.text,
                  fontSize: { xs: 40, sm: 50, md: 62 },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: { xs: -1, md: -2 },
                  mt: 2.5,
                }}
              >
                Local delivery, <GradientText>done fast.</GradientText>
              </Typography>
              <Typography sx={{ color: C.textSecondary, fontSize: { xs: 16, md: 18 }, mt: 3, lineHeight: 1.75, maxWidth: 520 }}>
                VlueRides connects you with local stores and trusted riders for food delivery, pabili, bills
                payment and pickup & drop-off — all in one simple app.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 4.5, flexWrap: 'wrap' }}>
                <Button size="large" startIcon={<DownloadRoundedIcon />} onClick={goToDownload} sx={primaryButtonSx}>
                  Download the App
                </Button>
                <Button
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={ghostButtonSx}
                >
                  Explore Services
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                  mt: 6,
                  pt: 4,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                {highlights.map((h) => (
                  <Box key={h.label}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: C.text }}>{h.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: C.textMuted }}>{h.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <PhoneMockup />
          </Box>
        </Container>
      </Box>

      {/* About */}
      <Box id="about" sx={{ scrollMarginTop: 72, py: { xs: 9, md: 13 }, bgcolor: C.surface }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>
            <Box>
              <SectionHeading
                align="left"
                eyebrow="About us"
                title="Delivering for our community"
                subtitle="VlueRides is a local delivery platform based in Trento, Agusan del Sur. We bring customers, local stores and riders together so everyday errands get done faster — while keeping business and livelihood in the community."
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {values.map(({ Icon, title, text }) => (
                <Box
                  key={title}
                  sx={{
                    display: 'flex',
                    gap: 2.5,
                    alignItems: 'flex-start',
                    p: 3,
                    borderRadius: 4,
                    bgcolor: C.bg,
                    border: `1px solid ${C.border}`,
                    transition: 'transform .2s, box-shadow .2s',
                    '&:hover': { transform: 'translateX(4px)', boxShadow: '0 12px 30px rgba(15,23,42,0.07)' },
                  }}
                >
                  <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 3, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ color: '#fff' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 17, color: C.text }}>{title}</Typography>
                    <Typography sx={{ color: C.textSecondary, mt: 0.5, lineHeight: 1.65, fontSize: 15 }}>{text}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services */}
      <Box id="services" sx={{ scrollMarginTop: 72, py: { xs: 9, md: 13 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Services"
            title="Everything you need, delivered"
            subtitle="From meals to errands, riders who know Trento get it done for you."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {services.map(({ Icon, color, title, text }) => (
              <Box
                key={title}
                sx={{
                  p: 3.5,
                  borderRadius: 5,
                  bgcolor: C.surface,
                  border: `1px solid ${C.border}`,
                  transition: 'box-shadow .25s, transform .25s, border-color .25s',
                  '&:hover': { boxShadow: '0 24px 48px rgba(15,23,42,0.10)', transform: 'translateY(-6px)', borderColor: `${color}55` },
                }}
              >
                <Box sx={{ width: 56, height: 56, borderRadius: 4, bgcolor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ color, fontSize: 30 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 19, mt: 3, color: C.text }}>{title}</Typography>
                <Typography sx={{ color: C.textSecondary, mt: 1, lineHeight: 1.7, fontSize: 15 }}>{text}</Typography>
              </Box>
            ))}
          </Box>

          {/* How it works */}
          <Box sx={{ mt: { xs: 8, md: 11 }, p: { xs: 3, md: 5 }, borderRadius: 6, bgcolor: C.surface, border: `1px solid ${C.border}` }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 24, md: 28 }, color: C.text, textAlign: 'center', letterSpacing: -0.5 }}>
              How it works
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 3, md: 4 }, mt: 4 }}>
              {steps.map(({ Icon, title, text }, i) => (
                <Box key={title} sx={{ textAlign: 'center', px: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon sx={{ color: C.primary, fontSize: 30 }} />
                    </Box>
                    <Box sx={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: GRADIENT, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      {i + 1}
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 17, mt: 2, color: C.text }}>{title}</Typography>
                  <Typography sx={{ color: C.textSecondary, mt: 0.5, fontSize: 15 }}>{text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Tracking — what sets VlueRides apart: live GPS plus SMS fallback when the rider is offline */}
      <Box id="tracking" sx={{ scrollMarginTop: 72, py: { xs: 9, md: 13 }, bgcolor: C.surface }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' }, gap: { xs: 6, md: 8 }, alignItems: 'center' }}>
            <Box>
              <SectionHeading
                align="left"
                eyebrow="What makes us different"
                title={<>Tracking that works <GradientText>even offline</GradientText></>}
                subtitle="Mobile data isn't always reliable. VlueRides keeps you updated either way — live on the map when your rider is online, and by SMS when they're not."
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: { xs: -2, md: -3 } }}>
                {trackingFeatures.map(({ Icon, title, text }) => (
                  <Box key={title} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 3, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon sx={{ color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 17, color: C.text }}>{title}</Typography>
                      <Typography sx={{ color: C.textSecondary, mt: 0.5, lineHeight: 1.65, fontSize: 15 }}>{text}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Online vs offline illustration */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ p: 3, borderRadius: 5, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WifiRoundedIcon sx={{ color: C.success, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.success }}>Rider online</Typography>
                  <Typography sx={{ fontSize: 13, color: C.textMuted, ml: 'auto' }}>Live map</Typography>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    height: 110,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: C.tint,
                    backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
                    backgroundSize: '22px 22px',
                  }}
                >
                  <Box aria-hidden sx={{ position: 'absolute', left: '12%', right: '18%', top: '55%', borderTop: `3px dashed ${C.primaryLight}` }} />
                  <Box sx={{ position: 'absolute', left: '52%', top: '55%', transform: 'translate(-50%, -50%)', width: 36, height: 36, borderRadius: '50%', background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 8px rgba(59,130,246,0.18)' }}>
                    <DeliveryDiningRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
                  </Box>
                  <PlaceRoundedIcon sx={{ position: 'absolute', right: '12%', top: '55%', transform: 'translate(50%, -85%)', color: C.danger, fontSize: 30 }} />
                </Box>
              </Box>

              <Box sx={{ p: 3, borderRadius: 5, bgcolor: C.navy, color: '#fff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SignalCellularConnectedNoInternet0BarRoundedIcon sx={{ color: '#FBBF24', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#FBBF24' }}>Rider offline</Typography>
                  <Typography sx={{ fontSize: 13, color: '#94A3B8', ml: 'auto' }}>SMS every 5 min</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2 }}>
                  {[
                    { time: '2:10 PM', place: 'Purok 13B, Barangay Poblacion' },
                    { time: '2:15 PM', place: 'Purok 14, Barangay Poblacion' },
                  ].map((m) => (
                    <Box key={m.time} sx={{ alignSelf: 'flex-start', maxWidth: '92%', px: 2, py: 1.25, borderRadius: '14px 14px 14px 4px', bgcolor: C.navySoft }}>
                      <Typography sx={{ fontSize: 13.5, lineHeight: 1.55, color: '#E2E8F0' }}>
                        <b>VlueRides:</b> Your rider has no internet connection right now. Food Delivery - 1x Hotdog. Total: PHP 200. Your rider is currently near{' '}
                        <Box component="span" sx={{ color: '#7DD3FC', fontWeight: 600 }}>{m.place}</Box>.
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.25 }}>{m.time}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 12, color: C.textMuted, textAlign: 'center' }}>Sample messages for illustration.</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Download call-to-action — the full guide lives on /download */}
      <Box sx={{ py: { xs: 9, md: 13 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 6,
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 8 },
              bgcolor: C.navy,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            <Box aria-hidden sx={{ position: 'absolute', width: 420, height: 420, top: -200, right: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.45), transparent 65%)' }} />
            <Box aria-hidden sx={{ position: 'absolute', width: 380, height: 380, bottom: -220, left: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.35), transparent 65%)' }} />
            <Box sx={{ position: 'relative' }}>
              <Eyebrow light>Free on Android</Eyebrow>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 30, md: 44 }, mt: 2, letterSpacing: -1, color: '#fff' }}>
                Ready to get started?
              </Typography>
              <Typography sx={{ color: '#CBD5E1', fontSize: 17, mt: 1.5, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
                Download the VlueRides app and read our quick installation guide and user guidelines.
              </Typography>
              <Button
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={goToDownload}
                sx={{
                  mt: 4,
                  px: 4,
                  py: 1.5,
                  bgcolor: '#fff',
                  color: C.navy,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#E0F2FE', transform: 'translateY(-2px)' },
                }}
              >
                Go to Download Page
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </PublicLayout>
  );
}
