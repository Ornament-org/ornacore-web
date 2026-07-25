'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ornacore-theme';
const DEFAULT_THEME = 'dark';

export function ThemeProvider({ children }) {
  // Start dark because this storefront is dark-first. The blocking inline
  // script in layout.jsx still honors a returning visitor's saved light mode
  // before paint; this state catches up right after hydration.
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const adoptStoredTheme = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setThemeState(stored === 'light' ? 'light' : 'dark');
      setHydrated(true);
    };

    adoptStoredTheme();
  }, []);

  useEffect(() => {
    // Guarded so this can't fire on the pre-hydration-correction render and
    // clobber the value the blocking script already applied (which would
    // reintroduce the exact flash this was built to avoid).
    if (!hydrated) return;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
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
