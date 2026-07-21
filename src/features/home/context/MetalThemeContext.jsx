'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { METALS, getMetal } from '@/constants/metals';
import { productApi } from '@/services/productApi';
import styles from './MetalThemeCanvas.module.scss';

const MetalThemeContext = createContext(null);

const isBackendMatch = (metalId, backendMetal) =>
  String(backendMetal.code ?? '').toUpperCase() === metalId.toUpperCase() ||
  backendMetal.name?.toLowerCase() === metalId;

export function MetalThemeProvider({ children, defaultMetal = 'all' }) {
  const [metalId, setMetalId] = useState(defaultMetal);
  // null = not loaded yet — kept distinct from [] (loaded, nothing active) so
  // the switcher doesn't flash down to a single "All Metals" tab on first paint.
  const [activeMetals, setActiveMetals] = useState(null);
  const metal = getMetal(metalId);

  useEffect(() => {
    let alive = true;
    productApi
      .getMetals()
      .then((response) => {
        if (alive) setActiveMetals(response.data ?? []);
      })
      .catch(() => {
        if (alive) setActiveMetals([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Toolbox is the source of truth: a metal turned off there (e.g. Diamond,
  // Silver) drops out of this list the moment it loads, everywhere this
  // provider is used — home, products, and category browsing all read from
  // the same `metals` array instead of the static, always-on constant.
  const metals = useMemo(() => {
    if (activeMetals === null) return METALS;
    return METALS.filter(
      (item) => item.id === 'all' || activeMetals.some((backendMetal) => isBackendMatch(item.id, backendMetal)),
    );
  }, [activeMetals]);

  // Adjusting state during render (React's documented pattern for this,
  // already used elsewhere in this codebase — see ProductDetailPage) rather
  // than setState-in-effect: if the selected tab (from a URL like
  // ?metal=diamond, or one picked before it was deactivated) isn't in the
  // active list anymore, fall back to "All Metals" instead of leaving a
  // hidden metal selected.
  if (activeMetals !== null && !metals.some((item) => item.id === metalId)) {
    setMetalId('all');
  }

  const value = useMemo(
    () => ({
      metalId,
      setMetalId,
      metal,
      metals,
    }),
    [metalId, metal, metals]
  );

  const cssVars = {
    '--accent': metal.accent,
    '--accent-dark': metal.accentDark,
    '--accent-light': metal.accentLight,
    '--accent-soft': metal.soft,
    '--accent-gradient': metal.gradient,
  };

  return (
    <MetalThemeContext.Provider value={value}>
      <div className={styles.canvas} data-metal={metalId} style={cssVars}>
        {children}
      </div>
    </MetalThemeContext.Provider>
  );
}

export function useMetalTheme() {
  const ctx = useContext(MetalThemeContext);
  if (!ctx) throw new Error('useMetalTheme must be used within MetalThemeProvider');
  return ctx;
}
