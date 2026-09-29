import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme/theme';
import { setColorMode } from '../theme/colors';

const STORAGE_KEY = 'vluerides-admin-theme-mode';

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// Sync the mutable AppColors singleton before first paint so every screen's
// `AppColors.xxx` reads (evaluated at render time) already match on load.
setColorMode(readStoredMode());

const ThemeModeContext = createContext(null);

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

// Most screens read the mutable AppColors object directly rather than via a
// hook, so a context-value change alone won't re-render them. Remounting the
// whole tree under a `key={mode}` on toggle guarantees every screen re-reads
// the freshly-mutated colors.
export default function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setColorMode(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore (private browsing / storage disabled)
      }
      return next;
    });
  };

  const muiTheme = useMemo(() => createAppTheme(mode), [mode]);
  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div key={mode}>{children}</div>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
