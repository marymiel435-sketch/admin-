import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mirrors lib/services/pdf_service.dart. jsPDF's default font (Helvetica)
// does support the ₱ symbol in the browser build's WinAnsi encoding, unlike
// Dart's pdf package — so the Noto Sans workaround isn't needed here.

const COLOR_PRIMARY = [21, 101, 192];
const COLOR_PRIMARY_LIGHT = [227, 242, 253];
const COLOR_SUCCESS = [56, 142, 60];
const COLOR_ERROR = [211, 47, 47];
const COLOR_WARNING = [245, 124, 0];
const COLOR_TEXT_PRIMARY = [26, 26, 46];
const COLOR_TEXT_SECONDARY = [107, 114, 128];

function formatCurrency(amount) {
  return `₱${(amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function statusColor(status) {
  const s = (status ?? '').toLowerCase();
  if (s === 'active' || s === 'approved') return COLOR_SUCCESS;
  if (s === 'suspended' || s === 'rejected') return COLOR_ERROR;
  if (s === 'pending approval') return COLOR_WARNING;
  return COLOR_TEXT_PRIMARY;
}

function addHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = doc.__margin;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.7);
  doc.line(margin, 24, pageWidth - margin, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('VLUE RIDES', margin, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text('Admin Panel', margin, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXT_PRIMARY);
  doc.text(title, pageWidth - margin, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text(subtitle, pageWidth - margin, 21, { align: 'right' });
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = doc.__margin;
  const now = new Date().toLocaleString('en-US', { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_TEXT_SECONDARY);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    doc.text(`Generated: ${now}`, margin, pageHeight - 9);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  }
}

function sectionTitle(doc, title, y) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = doc.__margin;
  doc.setFillColor(...COLOR_PRIMARY_LIGHT);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(title, margin + 3, y + 5.5);
}

function newDoc(orientation = 'p') {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  doc.__margin = 12;
  return doc;
}

function table(doc, startY, headers, rows, statusCol) {
  autoTable(doc, {
    startY,
    margin: { left: doc.__margin, right: doc.__margin },
    head: [headers],
    body: rows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLOR_PRIMARY, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    didParseCell: (data) => {
      if (statusCol != null && data.section === 'body' && data.column.index === statusCol) {
        data.cell.styles.textColor = statusColor(data.cell.text[0]);
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  return doc.lastAutoTable.finalY;
}

export function generateAnnualReport({ year, monthlyData, serviceBreakdown, totalRevenue, totalDeliveries }) {
  const doc = newDoc('p');
  addHeader(doc, 'Annual Summary Report', `Year ${year}`);
  const avg = totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0.0;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let y = 32;
  sectionTitle(doc, 'Summary', y);
  y += 12;
  const boxWidth = (doc.internal.pageSize.getWidth() - doc.__margin * 2 - 8) / 3;
  const stats = [
    ['Total Revenue', formatCurrency(totalRevenue), COLOR_SUCCESS],
    ['Total Deliveries', String(totalDeliveries), COLOR_PRIMARY],
    ['Avg. Delivery Fee', formatCurrency(avg), COLOR_WARNING],
  ];
  stats.forEach(([label, value, color], i) => {
    const x = doc.__margin + i * (boxWidth + 4);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, boxWidth, 18, 1.5, 1.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    doc.text(label, x + 3, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...color);
    doc.text(value, x + 3, y + 14);
  });

  y += 26;
  sectionTitle(doc, 'Monthly Breakdown', y);
  y += 4;
  y = table(
    doc,
    y + 4,
    ['Month', 'Orders', 'Revenue'],
    monthlyData.map((d, i) => [months[i], String(d.orders), formatCurrency(d.revenue)]),
  );

  if (Object.keys(serviceBreakdown).length > 0) {
    y += 8;
    sectionTitle(doc, 'Service Type Breakdown', y);
    const total = Object.values(serviceBreakdown).reduce((a, b) => a + b, 0);
    table(
      doc,
      y + 4,
      ['Service Type', 'Count', 'Percentage'],
      Object.entries(serviceBreakdown).map(([k, v]) => [k, String(v), `${total > 0 ? ((v / total) * 100).toFixed(1) : '0.0'}%`]),
    );
  }

  addFooter(doc);
  return doc;
}

export function generateRidersReport(riders) {
  const doc = newDoc('l');
  addHeader(doc, 'Riders Report', `Total: ${riders.length} riders`);
  table(
    doc,
    32,
    ['Full Name', 'Phone', 'Status', 'Plate No.', 'Vehicle', 'Rating', 'Deliveries'],
    riders.map((r) => [
      r.fullName,
      r.phoneNumber,
      r.accountStatus,
      r.plateNumber,
      `${r.motorcycleBrand} ${r.motorcycleModel}`.trim(),
      r.rating > 0 ? r.rating.toFixed(1) : '-',
      String(r.totalDeliveries),
    ]),
    2,
  );
  addFooter(doc);
  return doc;
}

export function generateCustomersReport(customers) {
  const doc = newDoc('l');
  addHeader(doc, 'Customers Report', `Total: ${customers.length} customers`);
  table(
    doc,
    32,
    ['Full Name', 'Email', 'Phone', 'Username', 'Status', 'Date Joined'],
    customers.map((c) => [c.fullName, c.email, c.phoneNumber, c.username, c.accountStatus, formatDate(c.createdAt)]),
    4,
  );
  addFooter(doc);
  return doc;
}

export function generateStoresReport(stores) {
  const doc = newDoc('l');
  addHeader(doc, 'Stores Report', `Total: ${stores.length} stores`);
  table(
    doc,
    32,
    ['Store Name', 'Category', 'Type', 'Phone', 'Address', 'Status', 'Rating'],
    stores.map((s) => [s.name, s.category, s.billType ?? s.pabiliType ?? '-', s.phoneNumber, s.address, s.accountStatus, s.rating.toFixed(1)]),
    5,
  );
  addFooter(doc);
  return doc;
}
