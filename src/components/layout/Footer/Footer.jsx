import Link from 'next/link';
import { Truck, RefreshCw, Award, Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './Footer.module.scss';

const TRUST_BADGES = [
  { icon: Truck, title: 'Free Shipping', subtitle: 'On all orders above ₹999' },
  { icon: RefreshCw, title: 'Lifetime Exchange', subtitle: 'On all gold jewellery' },
  { icon: Award, title: 'Certified Jewellery', subtitle: 'BIS Hallmarked' },
  { icon: Shield, title: 'Trusted by Millions', subtitle: 'Across India' },
];

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', href: ROUTES.HOME },
    { label: 'Products', href: ROUTES.PRODUCTS },
    { label: 'Collections', href: ROUTES.CATEGORIES },
    { label: 'Offers', href: `${ROUTES.PRODUCTS}?tag=offer` },
    { label: 'About Us', href: '/about' },
  ],
  'Customer Care': [
    { label: 'Track Order', href: ROUTES.ORDERS },
    { label: 'Return Policy', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
  'Business': [
    { label: 'Business Login', href: ROUTES.BUSINESS.LOGIN },
    { label: 'Partner With Us', href: ROUTES.BUSINESS.REGISTER },
    { label: 'Bulk Orders', href: '/bulk-orders' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Trust badges strip */}
      <div className={styles.trustStrip}>
        <div className={`container ${styles.trustInner}`}>
          {TRUST_BADGES.map((badge) => (
            <div key={badge.title} className={styles.trustBadge}>
              <badge.icon size={28} strokeWidth={1.5} className={styles.trustIcon} />
              <div>
                <p className={styles.trustTitle}>{badge.title}</p>
                <p className={styles.trustSub}>{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={`container ${styles.mainInner}`}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>✦</span>
              <div>
                <p className={styles.logoMain}>ORNACORE</p>
                <p className={styles.logoSub}>Timeless Elegance</p>
              </div>
            </div>
            <p className={styles.tagline}>
              Crafting exquisite jewellery for life&apos;s most precious moments.
              20+ years of trust across India.
            </p>
            <div className={styles.certBadges}>
              <span className={styles.cert}>BIS Certified</span>
              <span className={styles.cert}>100% Hallmarked</span>
              <span className={styles.cert}>Pan India</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className={styles.linkSection}>
              <h4 className={styles.linkHeading}>{section}</h4>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.link}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>© {new Date().getFullYear()} OrnaCo. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
