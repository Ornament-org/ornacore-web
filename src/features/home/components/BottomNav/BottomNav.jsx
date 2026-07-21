'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Zap, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './BottomNav.module.scss';

// Orders lives under Account (My Orders) now, rather than its own tab here.
const ITEMS = [
  { id: 'home', label: 'Home', href: ROUTES.HOME, icon: Home },
  { id: 'categories', label: 'Categories', href: ROUTES.CATEGORIES, icon: LayoutGrid },
  { id: 'quick-order', label: 'Quick Order', href: ROUTES.PRODUCTS, icon: Zap, primary: true },
  { id: 'account', label: 'Account', href: ROUTES.PROFILE, icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Primary">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        if (item.primary) {
          return (
            <Link key={item.id} href={item.href} className={styles.primaryItem}>
              <span className={styles.primaryBtn}>
                <item.icon size={22} strokeWidth={2} />
              </span>
              <span className={styles.primaryLabel}>{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.id}
            href={item.href}
            className={[styles.item, active && styles['item--active']].filter(Boolean).join(' ')}
          >
            <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
