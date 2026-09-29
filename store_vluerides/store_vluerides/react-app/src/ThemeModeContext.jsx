import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'vlue-rides-dashboard-theme-mode';

function getInitialMode() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ThemeModeContext = createContext(null);

// Scoped to the dashboard (see DashboardShell) rather than the whole app —
// the public/marketing site and auth screens are light-only, so only this
// subtree needs a mode to read and a way to flip it.
export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }),
    [mode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
