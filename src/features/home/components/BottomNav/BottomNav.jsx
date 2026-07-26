'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [optimisticTarget, setOptimisticTarget] = useState(null);

  useEffect(() => {
    ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const handleNavigate = (event, item) => {
    const { href } = item;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (pathname === href) {
      event.preventDefault();
      if (item.id === 'account') {
        window.dispatchEvent(new CustomEvent('ornacore:account-home'));
      }
      setOptimisticTarget(null);
      return;
    }
    setOptimisticTarget({ href, from: pathname });
  };

  return (
    <nav className={styles.nav} aria-label="Primary">
      {ITEMS.map((item) => {
        const visiblePathname = optimisticTarget?.from === pathname ? optimisticTarget.href : pathname;
        const active = visiblePathname === item.href || visiblePathname.startsWith(`${item.href}/`);
        if (item.primary) {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={styles.primaryItem}
              onClick={(event) => handleNavigate(event, item)}
              aria-current={active ? 'page' : undefined}
            >
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
            onClick={(event) => handleNavigate(event, item)}
            aria-current={active ? 'page' : undefined}
          >
            <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
