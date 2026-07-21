'use client';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Gem, Mail, Phone, MessageCircle, Globe } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './HomeFooter.module.scss';

const LINK_GROUPS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Partner With Us', href: ROUTES.BUSINESS.REGISTER },
  ],
  Support: [
    { label: 'Help Center', href: '/support' },
    { label: 'Track Orders', href: ROUTES.BUSINESS.ORDERS },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Return Policy', href: '/returns' },
  ],
};

const SOCIALS = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'Chat' },
  { icon: Mail, label: 'Email' },
];

export default function HomeFooter() {
  const displayName = useSelector((state) => state.branding.displayName);
  const logo = useSelector((state) => state.branding.logo);

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element -- logo host is admin-configurable from toolbox settings */}
              {logo ? <img src={logo} alt="" /> : <Gem size={18} strokeWidth={1.75} />}
            </span>
            <span className={styles.brandName}>{displayName}</span>
          </div>
          <p className={styles.tagline}>
            India&apos;s trusted B2B jewellery marketplace — wholesale pricing, hallmarked purity, pan-India delivery.
          </p>
          <div className={styles.contact}>
            <span className={styles.contactItem}><Phone size={13} /> +91 98765 43210</span>
            <span className={styles.contactItem}><Mail size={13} /> partners@swarnasetu.com</span>
          </div>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <span key={s.label} className={styles.socialIcon} aria-label={s.label}>
                <s.icon size={15} />
              </span>
            ))}
          </div>
        </div>

        {Object.entries(LINK_GROUPS).map(([group, links]) => (
          <div key={group} className={styles.linkCol}>
            <h4 className={styles.linkHeading}>{group}</h4>
            <ul className={styles.linkList}>
              {links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.linkCol}>
          <h4 className={styles.linkHeading}>Business Hours</h4>
          <p className={styles.hours}>Mon – Sat: 10:00 AM – 8:00 PM</p>
          <p className={styles.hours}>Sunday: Closed</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        <p className={styles.badge}>100% Hallmarked &middot; Secure &amp; Transparent &middot; Pan India Delivery</p>
      </div>
    </footer>
  );
}
