import { LineChart, Line, YAxis } from 'recharts';

// Decorative mini trend line, mirrors dashboard_screen.dart's _Sparkline —
// deterministic per color (same seed -> same shape) rather than truly random.
function hashColor(color) {
  let hash = 0;
  for (let i = 0; i < color.length; i++) {
    hash = (hash * 31 + color.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function points(color, count) {
  const rnd = mulberry32(hashColor(color));
  let v = 3 + rnd() * 2;
  const pts = [];
  for (let i = 0; i < count; i++) {
    v = Math.min(9, Math.max(1, v + (rnd() * 4 - 1.5)));
    pts.push({ x: i, y: v });
  }
  return pts;
}

export default function Sparkline({ color, width = 64, height = 32, count = 7 }) {
  const data = points(color, count);
  return (
    <LineChart width={width} height={height} data={data}>
      <YAxis domain={[0, 10]} hide />
      <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  );
}
