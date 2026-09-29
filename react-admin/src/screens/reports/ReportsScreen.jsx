import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, CircularProgress, Menu, MenuItem } from '@mui/material';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, YAxis, XAxis } from 'recharts';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import { AppColors } from '../../theme/colors';
import { useCustomers } from '../../context/CustomerContext';
import { useRiders } from '../../context/RiderContext';
import { useStores } from '../../context/StoreContext';
import * as firestoreService from '../../services/firestoreService';
import * as pdfService from '../../services/pdfService';
import { formatCurrency, getServiceTypeColor } from '../../utils/appUtils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mirrors lib/screens/reports/reports_screen.dart
export default function ReportsScreen() {
  const customerProvider = useCustomers();
  const riderProvider = useRiders();
  const storeProvider = useStores();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [serviceBreakdown, setServiceBreakdown] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearMenuAnchor, setYearMenuAnchor] = useState(null);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    customerProvider.startListening();
    riderProvider.startListening();
    storeProvider.startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (year) => {
    setIsLoading(true);
    setError(null);
    try {
      const monthly = await firestoreService.getMonthlyRevenueChart(year);
      const breakdown = await firestoreService.getServiceTypeBreakdown(new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59));
      let rev = 0;
      let orders = 0;
      monthly.forEach((d) => {
        rev += d.revenue;
        orders += d.orders;
      });
      setMonthlyData(monthly);
      setServiceBreakdown(breakdown);
      setTotalRevenue(rev);
      setTotalDeliveries(orders);
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const generatePdf = async (key, task) => {
    if (generating[key]) return;
    setGenerating((g) => ({ ...g, [key]: true }));
    try {
      await task();
    } catch {
      // errors are rare here (client-side PDF generation); silently ignore
      // rather than adding an unused snackbar plumbing for this edge case
    } finally {
      setGenerating((g) => {
        const next = { ...g };
        delete next[key];
        return next;
      });
    }
  };

  const onAnnual = () =>
    generatePdf('annual', async () => {
      const doc = pdfService.generateAnnualReport({ year: selectedYear, monthlyData, serviceBreakdown, totalRevenue, totalDeliveries });
      doc.save(`vluerides_annual_${selectedYear}.pdf`);
    });
  const onRiders = () =>
    generatePdf('riders', async () => {
      pdfService.generateRidersReport(riderProvider.allRiders).save('vluerides_riders.pdf');
    });
  const onCustomers = () =>
    generatePdf('customers', async () => {
      pdfService.generateCustomersReport(customerProvider.allCustomers).save('vluerides_customers.pdf');
    });
  const onStores = () =>
    generatePdf('stores', async () => {
      pdfService.generateStoresReport(storeProvider.allStores).save('vluerides_stores.pdf');
    });

  const avg = totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0.0;
  const revenueSeries = monthlyData.map((d, i) => ({ x: i, y: d.revenue }));
  const ordersSeries = monthlyData.map((d, i) => ({ x: i, y: d.orders }));
  const avgFeeSeries = monthlyData.map((d, i) => ({ x: i, y: d.orders > 0 ? d.revenue / d.orders : 0 }));

  const summaryCards = [
    { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: AttachMoneyIcon, bg: '#F0FDF4', color: '#16A34A', series: revenueSeries, subtitle: 'Total earnings from all deliveries' },
    { title: 'Completed Deliveries', value: String(totalDeliveries), icon: AssignmentTurnedInOutlinedIcon, bg: '#EFF6FF', color: '#2563EB', series: ordersSeries, subtitle: 'Total successful deliveries' },
    { title: 'Avg Delivery Fee', value: formatCurrency(avg), icon: TrendingUpIcon, bg: '#F5F3FF', color: '#7C3AED', series: avgFeeSeries, subtitle: 'Average delivery fee' },
  ];

  const reportCards = [
    { icon: BarChartRoundedIcon, color: AppColors.primary, title: 'Annual Summary', subtitle: `Revenue & deliveries for ${selectedYear}`, key: 'annual', onGenerate: onAnnual },
    { icon: DeliveryDiningIcon, color: AppColors.success, title: 'Riders Report', subtitle: 'All riders with status & stats', key: 'riders', onGenerate: onRiders },
    { icon: PeopleAltOutlinedIcon, color: AppColors.chartTeal, title: 'Customers Report', subtitle: 'All registered customers', key: 'customers', onGenerate: onCustomers },
    { icon: StoreOutlinedIcon, color: AppColors.warning, title: 'Stores Report', subtitle: 'All stores by category & type', key: 'stores', onGenerate: onStores },
  ];

  const serviceTotal = Object.values(serviceBreakdown).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(serviceBreakdown).map(([type, count]) => ({ name: type, value: count, color: getServiceTypeColor(type) }));
  const hasRevenueData = monthlyData.some((d) => d.revenue > 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Overview</Typography>
          <Typography sx={{ fontSize: 13, color: AppColors.textSecondary }}>Key performance summary for {selectedYear}</Typography>
        </Box>
        <Box onClick={(e) => setYearMenuAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1.5, borderRadius: '10px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.border}`, cursor: 'pointer' }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: AppColors.textSecondary }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{selectedYear}</Typography>
          <KeyboardArrowDownIcon fontSize="small" sx={{ color: AppColors.textSecondary }} />
        </Box>
        <Menu anchorEl={yearMenuAnchor} open={Boolean(yearMenuAnchor)} onClose={() => setYearMenuAnchor(null)}>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <MenuItem key={y} onClick={() => { setSelectedYear(y); setYearMenuAnchor(null); }}>{y}</MenuItem>
          ))}
        </Menu>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => loadData(selectedYear)}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: AppColors.primary }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: `${AppColors.error}14`, border: `1px solid ${AppColors.error}4D` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorOutlineIcon sx={{ color: AppColors.error, fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700 }}>Could not load analytics</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: AppColors.textSecondary, mt: 0.75 }}>{error}</Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadData(selectedYear)} sx={{ mt: 1.5 }}>
              Retry
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {summaryCards.map((c) => (
                <Grid item xs={12} md={4} key={c.title}>
                  <Box sx={{ p: '18px 18px 14px', borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ p: 1.25, borderRadius: '50%', bgcolor: c.bg, display: 'flex' }}>
                        <c.icon sx={{ color: c.color, fontSize: 20 }} />
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{c.title}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1.5, gap: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: c.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.value}</Typography>
                        <Typography sx={{ fontSize: 10.5, color: AppColors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subtitle}</Typography>
                      </Box>
                      <Box sx={{ width: 84, height: 40 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={c.series}>
                            <YAxis hide domain={[0, 'dataMax']} />
                            <Line type="monotone" dataKey="y" stroke={c.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Monthly Revenue</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: AppColors.primary }} />
                    <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>Revenue (₱)</Typography>
                  </Box>
                  <Box sx={{ height: 260, mt: 1.5, position: 'relative' }}>
                    {hasRevenueData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData.map((d, i) => ({ month: MONTHS[i], revenue: d.revenue }))}>
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: AppColors.textSecondary }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: AppColors.textSecondary }} axisLine={false} tickLine={false} />
                          <Line type="monotone" dataKey="revenue" stroke={AppColors.primary} strokeWidth={3} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: `${AppColors.primary}14` }}>
                          <InsertChartOutlinedRoundedIcon sx={{ fontSize: 30, color: `${AppColors.primary}99` }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>No data available</Typography>
                        <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary, textAlign: 'center', px: 3 }}>Revenue data will appear here once transactions are made.</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Service Type Breakdown</Typography>
                  {serviceTotal === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3.75 }}>
                      <PieChartOutlineIcon sx={{ fontSize: 34, color: `${AppColors.textSecondary}66` }} />
                      <Typography sx={{ fontSize: 13, color: AppColors.textSecondary, mt: 1.25 }}>No deliveries yet</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ position: 'relative', width: 190, height: 190, mx: 'auto', mt: 2.5 }}>
                        <PieChart width={190} height={190}>
                          <Pie data={pieData} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={2} isAnimationActive={false}>
                            {pieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                        </PieChart>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <Typography sx={{ fontSize: 28, fontWeight: 700 }}>{serviceTotal}</Typography>
                          <Typography sx={{ fontSize: 11, color: AppColors.textSecondary }}>Total Deliveries</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {Object.entries(serviceBreakdown).map(([type, count]) => {
                          const pct = serviceTotal > 0 ? (count / serviceTotal) * 100 : 0;
                          const color = getServiceTypeColor(type);
                          return (
                            <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
                              <Typography sx={{ flex: 1, fontSize: 12.5 }}>{type}</Typography>
                              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color }}>{count} ({pct.toFixed(0)}%)</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </>
        )}

        {/* Report generators */}
        <Box sx={{ mt: 3, p: 2.5, borderRadius: '16px', bgcolor: AppColors.surface, border: `1px solid ${AppColors.divider}`, boxShadow: `0 6px 14px ${AppColors.shadow}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1.1, borderRadius: '10px', bgcolor: `${AppColors.primary}1A`, display: 'flex' }}>
              <PictureAsPdfIcon sx={{ color: AppColors.primary, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Generate PDF Reports</Typography>
              <Typography sx={{ fontSize: 12, color: AppColors.textSecondary }}>Export data and insights in PDF format</Typography>
            </Box>
          </Box>
          <Grid container spacing={1.75} sx={{ mt: 0.5 }}>
            {reportCards.map((c) => (
              <Grid item xs={12} sm={6} lg={3} key={c.key}>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: AppColors.background, border: `1px solid ${AppColors.divider}`, height: 190, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: `${c.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon sx={{ color: c.color, fontSize: 22 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1.5 }}>{c.title}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: AppColors.textSecondary, mt: 0.5, flex: 1 }}>{c.subtitle}</Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    disabled={Boolean(generating[c.key])}
                    startIcon={generating[c.key] ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PictureAsPdfOutlinedIcon sx={{ fontSize: 15 }} />}
                    onClick={c.onGenerate}
                    sx={{ bgcolor: c.color, '&:hover': { bgcolor: c.color } }}
                  >
                    {generating[c.key] ? 'Generating...' : 'Generate PDF'}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
