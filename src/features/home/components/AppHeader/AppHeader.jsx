'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Search, ChevronDown, BadgeCheck, Gem } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './AppHeader.module.scss';

export default function AppHeader() {
  const displayName = useSelector((state) => state.branding.displayName);
  const logo = useSelector((state) => state.branding.logo);
  const shopkeeper = useSelector((state) => state.auth.user?.shopkeeper);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const isVerified = shopkeeper?.status === 'APPROVED';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={['app-header', styles.header, scrolled && styles['header--scrolled']].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <Link href={ROUTES.HOME} className={styles.brand}>
          <span className={styles.brandIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element -- logo host is admin-configurable (Cloudinary or local storage), so next/image's static domain allowlist can't be relied on */}
            {logo ? <img src={logo} alt="" /> : <Gem size={18} strokeWidth={1.75} />}
          </span>
          <span className={styles.brandName}>{displayName}</span>
        </Link>

        <form className={styles.search} role="search" onSubmit={(e) => e.preventDefault()}>
          <Search size={17} className={styles.searchIcon} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className={styles.searchInput}
            aria-label="Search products, categories, collections"
          />
        </form>

        <div className={styles.actions}>
          <ThemeToggle className={styles.themeToggle} />

          <Link href={ROUTES.PROFILE} className={styles.business}>
            <span className={styles.businessIconWrap}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 21V9l8-6 8 6v12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={styles.businessInfo}>
              <span className={styles.businessName}>{shopkeeper?.shopName || 'My Shop'}</span>
              <span className={styles.businessMeta}>
                Business Account
                {isVerified ? (
                  <span className={styles.verifiedBadge}>
                    <BadgeCheck size={12} /> Verified
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronDown size={16} className={styles.businessChevron} />
          </Link>
        </div>
      </div>
    </header>
  );
}
