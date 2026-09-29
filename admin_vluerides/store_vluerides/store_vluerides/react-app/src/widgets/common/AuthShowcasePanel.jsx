import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

const DEFAULT_FEATURES = [
  { icon: StorefrontOutlinedIcon, text: 'Showcase your products with photos & prices' },
  { icon: DeliveryDiningOutlinedIcon, text: 'Get discovered by riders nearby' },
  { icon: InsightsOutlinedIcon, text: 'Manage everything from a single dashboard' },
];

export function DecorCircle({ size, color, sx }) {
  return <Box sx={{ position: 'absolute', width: size, height: size, borderRadius: '50%', bgcolor: color, ...sx }} />;
}

function Feature({ icon: Icon, text }) {
  return (
    <Box display="flex" alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          bgcolor: 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ color: '#fff', fontSize: 18 }} />
      </Box>
      <Box width={14} />
      <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontSize: 14.5, lineHeight: 1.4 }}>{text}</Typography>
    </Box>
  );
}

// Brand showcase shown alongside the sign-in/registration forms on wide
// (desktop/web) screens — shared so Login and Register present the same
// visual identity. The parent is responsible for sizing/pinning this (see
// LoginScreen/RegisterScreen: it's rendered inside a sticky, viewport-height
// column so it stays put while the form beside it scrolls independently.
export default function AuthShowcasePanel({
  heading = (
    <>
      Your store, online
      <br />
      and on the move.
    </>
  ),
  description = 'List your products, manage orders, and reach more riders across Trento, Agusan del Sur — all from one simple dashboard.',
  features = DEFAULT_FEATURES,
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        background: `linear-gradient(155deg, #0B1F45 0%, ${theme.palette.primary.main} 55%, #3E8EF7 100%)`,
      }}
    >
      <DecorCircle size={340} color="rgba(255,255,255,0.06)" sx={{ top: -120, right: -100 }} />
      <DecorCircle size={260} color="rgba(255,176,32,0.10)" sx={{ bottom: -110, left: -70 }} />
      <DecorCircle size={70} color="rgba(255,255,255,0.10)" sx={{ top: '28%', right: '14%' }} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 7,
          py: 6,
          overflowY: 'auto',
        }}
      >
        <Fade in timeout={600}>
          <Box maxWidth={480}>
            <Box display="flex" alignItems="center">
              <Box component="img" src={`${import.meta.env.BASE_URL}logo.png`} alt="Vlue Rides" sx={{ width: 56, height: 56 }} />
              <Box width={14} />
              <Typography variant="h4" fontWeight={800} color="#fff">
                Vlue Rides
              </Typography>
            </Box>
            <Box height={36} />
            <Typography
              variant="h3"
              fontWeight={800}
              color="#fff"
              sx={{ lineHeight: 1.15, letterSpacing: '-0.02em', fontSize: { xs: 32, md: 42 } }}
            >
              {heading}
            </Typography>
            <Box height={16} />
            <Typography sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, fontSize: 17 }}>
              {description}
            </Typography>
            <Box height={40} />
            <Box display="flex" flexDirection="column" gap={2.25}>
              {features.map((f) => (
                <Feature key={f.text} icon={f.icon} text={f.text} />
              ))}
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
