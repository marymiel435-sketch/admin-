import Box from '@mui/material/Box';
import { useEffect, useRef, useState } from 'react';

// Lays child form fields side by side on wide containers and stacks them on
// narrow ones, so a two-column desktop layout degrades cleanly on mobile
// widths instead of squeezing fields.
export default function ResponsiveFieldRow({ children, breakpoint = 420 }) {
  const containerRef = useRef(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setNarrow(width < breakpoint);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [breakpoint]);

  const items = Array.isArray(children) ? children : [children];

  return (
    <Box ref={containerRef} display="flex" flexDirection={narrow ? 'column' : 'row'} alignItems={narrow ? 'stretch' : 'flex-start'}>
      {items.map((child, i) => (
        <Box
          key={i}
          flex={narrow ? undefined : 1}
          ml={!narrow && i > 0 ? 2 : 0}
          mt={narrow && i > 0 ? 1.5 : 0}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
}
