import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import { AppColors } from '../theme/colors';

// Mirrors dashboard_screen.dart's _buildDonutCard
export default function DonutCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  segments,
  centerValue,
  centerLabel,
  bannerIcon: BannerIcon,
  bannerColor,
  bannerTitle,
  bannerSubtitle,
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const pieData = total <= 0
    ? [{ name: 'empty', value: 1, color: AppColors.divider }]
    : segments.map((s) => ({ ...s, value: s.value <= 0 ? 0.001 : s.value }));

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '14px',
        bgcolor: AppColors.surface,
        border: `1px solid ${AppColors.divider}`,
        boxShadow: `0 8px 18px ${AppColors.shadow}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            p: 1.1,
            borderRadius: '10px',
            bgcolor: `${accent}1A`,
            display: 'flex',
          }}
        >
          <Icon sx={{ color: accent, fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: AppColors.textPrimary }}>{title}</Typography>
          <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>{subtitle}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 2.5 }}>
        <Box sx={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
          <PieChart width={130} height={130}>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={42}
              outerRadius={62}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: AppColors.textPrimary, lineHeight: 1.1 }}>
              {centerValue}
            </Typography>
            <Typography sx={{ fontSize: 10, color: AppColors.textSecondary, textAlign: 'center' }}>
              {centerLabel}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {segments.map((s) => (
            <Box key={s.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                <Typography sx={{ fontSize: 12.5, color: AppColors.textSecondary }}>{s.name}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.valueStr}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.25,
          mt: 2,
          p: 1.5,
          borderRadius: '10px',
          bgcolor: `${bannerColor}14`,
        }}
      >
        <BannerIcon sx={{ fontSize: 16, color: bannerColor, mt: 0.25 }} />
        <Box>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: AppColors.textPrimary }}>
            {bannerTitle}
          </Typography>
          <Typography sx={{ fontSize: 10, color: AppColors.textSecondary }}>{bannerSubtitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
