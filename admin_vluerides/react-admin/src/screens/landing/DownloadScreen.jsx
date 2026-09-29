import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AndroidRoundedIcon from '@mui/icons-material/AndroidRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SdStorageRoundedIcon from '@mui/icons-material/SdStorageRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import DoNotDisturbOnRoundedIcon from '@mui/icons-material/DoNotDisturbOnRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PublicLayout, {
  C,
  GRADIENT,
  APP_DOWNLOAD_LINK,
  APP_FILE_NAME,
  APP_SIZE,
  Eyebrow,
  GradientText,
  HeroGlow,
  PhoneMockup,
  SectionHeading,
  primaryButtonSx,
} from './PublicLayout';

const requirements = [
  { Icon: AndroidRoundedIcon, title: 'Android 8.0+', text: 'Works on most Android phones.' },
  { Icon: SdStorageRoundedIcon, title: '400 MB free', text: `The app is ${APP_SIZE}; extra space is needed to install it.` },
  { Icon: WifiRoundedIcon, title: 'Internet', text: 'Mobile data or Wi-Fi to order and track.' },
  { Icon: LocationOnRoundedIcon, title: 'Location on', text: 'So riders can find your exact address.' },
];

const installSteps = [
  { title: 'Download the app', text: `Tap the "Download for Android" button on this page. The APK file (${APP_SIZE}) will start downloading — use Wi-Fi if you can and wait for it to finish.` },
  {
    title: 'Allow the installation',
    text: 'If your phone asks, allow installing apps from this source (Settings → Security → Install unknown apps). You only need to do this once.',
  },
  { title: 'Install and open', text: 'Open the downloaded file, tap Install, then open VlueRides.' },
  { title: 'Create your account', text: 'Sign up with your name, mobile number and email, then verify your account.' },
  { title: 'Set your delivery address', text: 'Allow location access and pin your home on the map, including your barangay and purok.' },
  { title: 'Start ordering', text: 'Browse stores, place your order and track your rider live until it arrives.' },
];

const guidelineGroups = [
  {
    Icon: ShoppingBagRoundedIcon,
    color: C.primary,
    title: 'Placing orders',
    dos: [
      'Double-check your items, quantities and delivery address before confirming.',
      'Add clear notes for your rider (landmarks, gate color, who will receive).',
      'Keep your phone on so the rider can reach you.',
      'Prepare the exact amount or have change ready for cash payments.',
    ],
    donts: [
      'Place fake, prank or duplicate orders.',
      'Cancel an order after the rider has already bought or picked up your items.',
    ],
  },
  {
    Icon: HealthAndSafetyRoundedIcon,
    color: '#16A34A',
    title: 'Respect & safety',
    dos: [
      'Treat riders and store staff with courtesy and respect.',
      'Check your order when it arrives and report problems through the app right away.',
      'Meet your rider at a safe, easy-to-find location.',
    ],
    donts: [
      'Harass, threaten or verbally abuse riders or store staff.',
      'Ask riders to break traffic rules or deliver outside the service area.',
    ],
  },
  {
    Icon: DoNotDisturbOnRoundedIcon,
    color: '#DC2626',
    title: 'Prohibited items',
    dos: ['Order only legal items that local stores are allowed to sell.'],
    donts: [
      'Illegal drugs, weapons, explosives or other dangerous goods.',
      'Alcohol or tobacco for anyone below 18 years old.',
      'Live animals, stolen goods, or anything prohibited by law.',
    ],
  },
  {
    Icon: LockRoundedIcon,
    color: '#7C3AED',
    title: 'Account & privacy',
    dos: ['Keep your login details private and use a strong password.', 'Keep your name, number and address up to date.'],
    donts: [
      'Share your account or create multiple accounts.',
      'Share riders’ or other users’ personal information outside the app.',
    ],
  },
];

const faqs = [
  {
    q: 'Is the VlueRides app free?',
    a: 'Yes. Downloading and using the app is free. You only pay for your order and the delivery fee shown before you confirm.',
  },
  {
    q: 'How is the delivery fee computed?',
    a: 'The delivery fee is based on a base fee plus the distance from the store to your address. You will always see the total before placing your order.',
  },
  { q: 'Where does VlueRides deliver?', a: 'We currently serve barangays and puroks within Trento, Agusan del Sur.' },
  {
    q: 'My phone says the app may be harmful. Is it safe?',
    a: 'Android shows this warning for apps installed outside the Play Store. Only download VlueRides from this official page and it is safe to install.',
  },
  {
    q: 'I want to become a rider or partner store. How?',
    a: 'Riders can register through the app and complete verification at the VlueRides office. Stores can apply and wait for admin approval before appearing to customers.',
  },
];

function DownloadButton({ sx }) {
  return (
    <Button
      href={APP_DOWNLOAD_LINK}
      download={APP_FILE_NAME}
      size="large"
      startIcon={<DownloadRoundedIcon />}
      sx={{ ...primaryButtonSx, px: 4, py: 1.6, fontSize: 16, ...sx }}
    >
      Download for Android · {APP_SIZE}
    </Button>
  );
}

export default function DownloadScreen() {
  return (
    <PublicLayout>
      {/* Hero */}
      <Box sx={{ position: 'relative', pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <HeroGlow />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Eyebrow>Download App</Eyebrow>
              <Typography
                component="h1"
                sx={{ color: C.text, fontSize: { xs: 38, sm: 48, md: 58 }, fontWeight: 800, lineHeight: 1.05, letterSpacing: { xs: -1, md: -2 }, mt: 2.5 }}
              >
                Get <GradientText>VlueRides</GradientText> on your phone
              </Typography>
              <Typography sx={{ color: C.textSecondary, fontSize: { xs: 16, md: 18 }, mt: 3, lineHeight: 1.75, maxWidth: 500 }}>
                Food delivery, pabili, bills payment and pickup & drop-off in Trento — all in one app. Free to download and easy to set up.
              </Typography>
              <Box sx={{ mt: 4.5 }}>
                <DownloadButton />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 }, mt: 3 }}>
                {['Free download', `${APP_SIZE} APK`, 'Android 8.0 or newer', 'Official app'].map((t) => (
                  <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <VerifiedRoundedIcon sx={{ fontSize: 18, color: C.success }} />
                    <Typography sx={{ fontSize: 14, color: C.textSecondary, fontWeight: 500 }}>{t}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <PhoneMockup />
          </Box>
        </Container>
      </Box>

      {/* Requirements */}
      <Box sx={{ py: { xs: 9, md: 12 }, bgcolor: C.surface }}>
        <Container maxWidth="lg">
          <SectionHeading eyebrow="Before you install" title="Requirements" subtitle="Make sure your phone is ready." />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 } }}>
            {requirements.map(({ Icon, title, text }) => (
              <Box
                key={title}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 5,
                  bgcolor: C.bg,
                  border: `1px solid ${C.border}`,
                  textAlign: 'center',
                  transition: 'transform .2s, box-shadow .2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 36px rgba(15,23,42,0.08)' },
                }}
              >
                <Box sx={{ width: 56, height: 56, mx: 'auto', borderRadius: 4, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mt: 2, color: C.text }}>{title}</Typography>
                <Typography sx={{ color: C.textSecondary, fontSize: 14, mt: 0.5, lineHeight: 1.6 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Installation guide — vertical timeline */}
      <Box sx={{ py: { xs: 9, md: 12 } }}>
        <Container maxWidth="md">
          <SectionHeading eyebrow="Step by step" title="Installation & getting started" subtitle="You’ll be ordering in just a few minutes." />
          <Box sx={{ position: 'relative' }}>
            <Box
              aria-hidden
              sx={{ position: 'absolute', left: 23, top: 24, bottom: 24, width: 2, background: `linear-gradient(${C.primary}, ${C.cyan})`, opacity: 0.35 }}
            />
            {installSteps.map((step, i) => (
              <Box key={step.title} sx={{ position: 'relative', display: 'flex', gap: { xs: 2, md: 3 }, mb: i === installSteps.length - 1 ? 0 : 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: GRADIENT,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 0 6px ${C.bg}, 0 8px 18px rgba(21,101,192,0.3)`,
                  }}
                >
                  {i + 1}
                </Box>
                <Box sx={{ flex: 1, p: { xs: 2.25, md: 3 }, borderRadius: 4, bgcolor: C.surface, border: `1px solid ${C.border}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 17, color: C.text }}>{step.title}</Typography>
                  <Typography sx={{ color: C.textSecondary, mt: 0.5, lineHeight: 1.7, fontSize: 15 }}>{step.text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Guidelines */}
      <Box sx={{ py: { xs: 9, md: 12 }, bgcolor: C.surface }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Community"
            title="User guidelines"
            subtitle="These guidelines keep VlueRides safe and fair for customers, riders and stores. Accounts that break them may be suspended."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {guidelineGroups.map(({ Icon, color, title, dos, donts }) => (
              <Box key={title} sx={{ p: { xs: 3, md: 4 }, borderRadius: 5, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ color, fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 19, color: C.text }}>{title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {dos.map((t) => (
                    <Box key={t} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 22, height: 22, flexShrink: 0, mt: '1px', borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckRoundedIcon sx={{ fontSize: 15, color: C.success }} />
                      </Box>
                      <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: C.text }}>{t}</Typography>
                    </Box>
                  ))}
                  {donts.map((t) => (
                    <Box key={t} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 22, height: 22, flexShrink: 0, mt: '1px', borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CloseRoundedIcon sx={{ fontSize: 15, color: C.danger }} />
                      </Box>
                      <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: C.text }}>
                        <Box component="span" sx={{ fontWeight: 700, color: C.danger }}>Don’t:</Box> {t}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              mt: 3,
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              bgcolor: '#FFF7ED',
              border: '1px solid #FED7AA',
            }}
          >
            <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 3, bgcolor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldRoundedIcon sx={{ color: '#EA580C' }} />
            </Box>
            <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: '#7C2D12' }}>
              <b>Stay safe:</b> only download VlueRides from this official page. We will never ask for your password,
              OTP or PIN through calls or messages.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Box sx={{ py: { xs: 9, md: 12 } }}>
        <Container maxWidth="md">
          <SectionHeading eyebrow="Help" title="Frequently asked questions" />
          {faqs.map((f) => (
            <Accordion
              key={f.q}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: C.surface,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: '16px !important',
                mb: 1.5,
                px: 1,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { borderColor: C.primary, boxShadow: '0 12px 28px rgba(21,101,192,0.10)' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: C.primary }} />} sx={{ py: 0.75 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: C.text }}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography sx={{ color: C.textSecondary, lineHeight: 1.75, fontSize: 15 }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ pb: { xs: 9, md: 12 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 6,
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 8 },
              bgcolor: C.navy,
              textAlign: 'center',
            }}
          >
            <Box aria-hidden sx={{ position: 'absolute', width: 420, height: 420, top: -200, right: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.45), transparent 65%)' }} />
            <Box aria-hidden sx={{ position: 'absolute', width: 380, height: 380, bottom: -220, left: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.35), transparent 65%)' }} />
            <Box sx={{ position: 'relative' }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 30, md: 44 }, letterSpacing: -1, color: '#fff' }}>
                Get VlueRides now
              </Typography>
              <Typography sx={{ color: '#CBD5E1', mt: 1.5, mb: 4, fontSize: 17 }}>Free download · {APP_SIZE} · Android 8.0 or newer</Typography>
              <DownloadButton />
            </Box>
          </Box>
        </Container>
      </Box>
    </PublicLayout>
  );
}
