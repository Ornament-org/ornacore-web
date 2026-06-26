'use client';
import { Filter } from 'lucide-react';
import styles from './ProductFilters.module.scss';

const METALS = ['All', 'Gold', 'Diamond', 'Silver', 'Platinum'];
const CATEGORIES = ['All', 'Necklaces', 'Rings', 'Bangles', 'Earrings', 'Pendants', 'Chains'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className={styles.wrapper}>
      {/* Mobile: filter bar */}
      <div className={styles.topBar}>
        <div className={styles.metalTabs}>
          {METALS.map((m) => (
            <button
              key={m}
              className={[styles.metalTab, filters.metal === m && styles['metalTab--active']].filter(Boolean).join(' ')}
              onClick={() => set('metal', m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className={styles.rightControls}>
          <select
            className={styles.sortSelect}
            value={filters.sort || 'popular'}
            onChange={(e) => set('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className={styles.chips}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={[styles.chip, filters.category === cat && styles['chip--active']].filter(Boolean).join(' ')}
            onClick={() => set('category', cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
