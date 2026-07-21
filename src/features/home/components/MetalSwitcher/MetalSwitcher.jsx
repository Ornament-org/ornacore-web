'use client';
import { Gem, CircleDot, Diamond, Sparkles, LayoutGrid } from 'lucide-react';
import { useMetalTheme } from '../../context/MetalThemeContext';
import styles from './MetalSwitcher.module.scss';

const ICONS = {
  gem: Gem,
  'circle-dot': CircleDot,
  diamond: Diamond,
  sparkles: Sparkles,
  'layout-grid': LayoutGrid,
};

export default function MetalSwitcher() {
  const { metals, metalId, setMetalId } = useMetalTheme();

  return (
    <div className={styles.wrap}>
      <div className={styles.track} role="tablist" aria-label="Select metal">
        {metals.map((m) => {
          const Icon = ICONS[m.icon] || Gem;
          const active = m.id === metalId;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={[styles.tab, active && styles['tab--active']].filter(Boolean).join(' ')}
              onClick={() => setMetalId(m.id)}
              style={active ? { '--tab-accent': m.accent, '--tab-gradient': m.gradient } : undefined}
            >
              <span className={styles.tabIcon}>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className={styles.tabText}>
                <span className={styles.tabLabel}>{m.label}</span>
                <span className={styles.tabSubtitle}>{m.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
