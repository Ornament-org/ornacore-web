'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, BookOpen,
  Wallet, BarChart3, User, LogOut, Package
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './B2BSidebar.module.scss';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.BUSINESS.DASHBOARD },
  { label: 'Catalog', icon: Package, href: ROUTES.BUSINESS.CATALOG },
  { label: 'Orders', icon: ShoppingBag, href: ROUTES.BUSINESS.ORDERS },
  { label: 'Khatabook', icon: BookOpen, href: ROUTES.BUSINESS.KHATABOOK },
  { label: 'Ledger', icon: BarChart3, href: ROUTES.BUSINESS.LEDGER },
  { label: 'Payments', icon: Wallet, href: ROUTES.BUSINESS.PAYMENTS },
  { label: 'Profile', icon: User, href: ROUTES.BUSINESS.PROFILE },
];

export default function B2BSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>✦</span>
        <div>
          <p className={styles.logoMain}>ORNACORE</p>
          <p className={styles.logoSub}>Business</p>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.navItem, active && styles['navItem--active']].filter(Boolean).join(' ')}
            >
              <item.icon size={18} className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
