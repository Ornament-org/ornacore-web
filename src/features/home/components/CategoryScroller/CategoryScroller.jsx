'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gem } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { productApi } from '@/services/productApi';
import { useMetalIdMap } from '@/hooks/useMetalIdMap';
import { useMetalTheme } from '../../context/MetalThemeContext';
import styles from './CategoryScroller.module.scss';

const DEFAULT_MAX_CATEGORIES = 4;

function CategoryItem({ category, metalId }) {
  return (
    <Link href={`${ROUTES.CATEGORIES}?metal=${metalId}&category=${category.slug}`} className={styles.item}>
      <span className={styles.iconWrap}>
        {category.image?.secureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- category image host is admin-configurable, not a fixed remote-pattern domain
          <img src={category.image.secureUrl} alt="" />
        ) : (
          <Gem size={26} strokeWidth={1.25} />
        )}
      </span>
      <span className={styles.label}>{category.name}</span>
    </Link>
  );
}

// "Shop by Category" is a mandatory homepage block — always present (though
// an admin can hide it via the section's Visibility toggle). Two curation
// modes, set in Homepage Management:
//   - `config.showAllCategories`: every active category, no hand-picking.
//     On the "All Metals" tab this pulls every metal at once, so it groups
//     into one row per metal (Gold categories, Silver categories, ...)
//     instead of dumping everything into one mixed strip.
//   - otherwise, `config.categoryIds` (hand-picked) or, failing that, the
//     legacy per-category "Feature on homepage" toggle.
export default function CategoryScroller({ title = 'Shop by Category', config = {} }) {
  const { metalId } = useMetalTheme();
  const metalIdMap = useMetalIdMap();
  const [categories, setCategories] = useState([]);
  const showAll = Boolean(config.showAllCategories);
  const maxItems = Number(config.maxItems) > 0 ? Number(config.maxItems) : DEFAULT_MAX_CATEGORIES;
  const curatedIds = Array.isArray(config.categoryIds) ? config.categoryIds : [];
  const curatedKey = curatedIds.join(',');

  useEffect(() => {
    if (!metalIdMap) return undefined;
    const backendMetalId = metalId === 'all' ? undefined : metalIdMap[metalId];

    const params = { metalId: backendMetalId || undefined };
    if (!showAll) {
      if (curatedKey) params.ids = curatedKey;
      else params.featured = true;
    }

    let alive = true;
    productApi
      .getCategories(params)
      .then((response) => {
        if (!alive) return;
        setCategories(response.data ?? []);
      })
      .catch(() => {
        if (alive) setCategories([]);
      });
    return () => {
      alive = false;
    };
  }, [metalId, metalIdMap, showAll, curatedKey]);

  if (!categories.length) return null;

  // Grouped-by-metal only makes sense when showing everything on the mixed
  // "All Metals" tab — a curated pick or a single-metal tab is already one
  // coherent list.
  const groupByMetal = showAll && metalId === 'all';
  const groups = groupByMetal
    ? Object.values(
        categories.reduce((acc, category) => {
          const key = category.metal?.id ?? 'unassigned';
          if (!acc[key]) acc[key] = { label: category.metal?.name ?? 'Other', items: [] };
          acc[key].items.push(category);
          return acc;
        }, {}),
      ).map((group) => ({ ...group, items: group.items.slice(0, maxItems) }))
    : [{ label: null, items: categories.slice(0, maxItems) }];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Link href={`${ROUTES.CATEGORIES}?metal=${metalId}`} className={styles.viewAll}>
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {groupByMetal ? (
        <div className={styles.groups}>
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              <h3 className={styles.groupTitle}>{group.label} categories</h3>
              <div className={styles.scroller}>
                {group.items.slice(0, maxItems).map((category) => (
                  <CategoryItem key={category.id} category={category} metalId={metalId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.scroller}>
          {groups[0].items.map((category) => (
            <CategoryItem key={category.id} category={category} metalId={metalId} />
          ))}
        </div>
      )}
    </section>
  );
}
