'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ornacore-theme';
const DEFAULT_THEME = 'light';

export function ThemeProvider({ children }) {
  // Always starts at the SSR-safe default so the very first client render
  // (hydration) matches the server-rendered HTML exactly — branching on
  // `typeof window` in a useState initializer (the previous approach) makes
  // that first client render disagree with the server, which is a hydration
  // mismatch React can't reconcile.
  //
  // The blocking inline script in layout.jsx already applies the real
  // stored theme to <html data-theme> before paint, so there's no visual
  // flash despite React itself starting from 'light' — this state just
  // needs to catch up to match, once, right after hydration.
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const adoptStoredTheme = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') setThemeState('dark');
      setHydrated(true);
    };

    adoptStoredTheme();
  }, []);

  useEffect(() => {
    // Guarded so this can't fire on the pre-hydration-correction render and
    // clobber the value the blocking script already applied (which would
    // reintroduce the exact flash this was built to avoid).
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const setTheme = (next) => setThemeState(next === 'dark' ? 'dark' : 'light');
  const toggleTheme = () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
