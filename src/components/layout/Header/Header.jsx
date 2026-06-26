'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { toggleMobileMenu, closeMobileMenu, toggleSearch } from '@/redux/slices/uiSlice';
import styles from './Header.module.scss';

const NAV_LINKS = [
  { label: 'Gold', href: `${ROUTES.PRODUCTS}?metal=gold` },
  { label: 'Diamond', href: `${ROUTES.PRODUCTS}?metal=diamond` },
  { label: 'Silver', href: `${ROUTES.PRODUCTS}?metal=silver` },
  { label: 'Collections', href: ROUTES.CATEGORIES },
  { label: 'Offers', href: `${ROUTES.PRODUCTS}?tag=offer` },
  { label: 'About Us', href: '/about' },
];

export default function Header() {
  const dispatch = useDispatch();
  const cartCount = useSelector((s) => s.cart.count);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);
  const mobileMenuOpen = useSelector((s) => s.ui.mobileMenuOpen);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={[styles.header, scrolled && styles['header--scrolled']].filter(Boolean).join(' ')}>
      <div className={`container ${styles.inner}`}>
        {/* Mobile menu button */}
        <button
          className={styles.menuBtn}
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link href={ROUTES.HOME} className={styles.logo} onClick={() => dispatch(closeMobileMenu())}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>
            <span className={styles.logoMain}>ORNACORE</span>
            <span className={styles.logoSub}>Timeless Elegance</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => dispatch(toggleSearch())} aria-label="Search">
            <Search size={20} />
          </button>

          <Link href={ROUTES.WISHLIST} className={styles.actionBtn} aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>

          <Link href={ROUTES.CART} className={styles.actionBtn} aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <Link href={ROUTES.PROFILE} className={styles.actionBtn} aria-label="Profile">
              <User size={20} />
            </Link>
          ) : (
            <Link href={ROUTES.LOGIN} className={styles.signInBtn}>Sign In</Link>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => dispatch(closeMobileMenu())}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            <Link href={ROUTES.BUSINESS.LOGIN} className={styles.mobileBusinessLink} onClick={() => dispatch(closeMobileMenu())}>
              Business Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
