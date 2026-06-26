'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Truck, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './HeroBanner.module.scss';

const SLIDES = [
  {
    id: 1,
    tag: 'Timeless Beauty',
    headline: 'Crafted with Love,',
    highlight: 'Cherished Forever',
    sub: 'Discover exquisite jewellery designs that celebrate every moment of your life.',
    cta: { label: 'Shop Now', href: ROUTES.PRODUCTS },
    ctaSecondary: { label: 'Explore Collections', href: ROUTES.CATEGORIES },
    bg: 'linear-gradient(135deg, #fdf8f0 0%, #f5e6c8 100%)',
    imagePlaceholder: 'gold',
  },
  {
    id: 2,
    tag: 'Wedding Season',
    headline: 'Your Perfect',
    highlight: 'Wedding Look',
    sub: 'From bridal sets to everyday elegance — explore our curated wedding collection.',
    cta: { label: 'Shop Collection', href: `${ROUTES.CATEGORIES}?tag=wedding` },
    ctaSecondary: { label: 'View Bridal Sets', href: `${ROUTES.PRODUCTS}?tag=bridal` },
    bg: 'linear-gradient(135deg, #faf5ec 0%, #f0dfc0 100%)',
    imagePlaceholder: 'diamond',
  },
  {
    id: 3,
    tag: 'New Arrivals',
    headline: 'Making Charges',
    highlight: 'Starting at 5%',
    sub: 'Transparent pricing on all gold jewellery. No hidden charges.',
    cta: { label: 'Shop Gold', href: `${ROUTES.PRODUCTS}?metal=gold` },
    ctaSecondary: { label: 'View Silver', href: `${ROUTES.PRODUCTS}?metal=silver` },
    bg: 'linear-gradient(135deg, #fdf9f3 0%, #eee5d5 100%)',
    imagePlaceholder: 'silver',
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: '100% Hallmarked', sub: 'Certified Jewellery' },
  { icon: Truck, label: 'Secure & Insured', sub: 'Safe Delivery' },
  { icon: RefreshCw, label: 'Easy Returns', sub: '7 Day Return Policy' },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className={styles.hero} style={{ background: slide.bg }}>
      <div className={`container ${styles.inner}`}>
        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className={styles.content}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.tag}>{slide.tag}</span>
            <h1 className={styles.headline}>
              {slide.headline}
              <br />
              <span className={styles.highlight}>{slide.highlight}</span>
            </h1>
            <p className={styles.sub}>{slide.sub}</p>

            <div className={styles.ctaGroup}>
              <Link href={slide.cta.href} className={styles.ctaPrimary}>
                {slide.cta.label}
                <ArrowRight size={16} />
              </Link>
              <Link href={slide.ctaSecondary.href} className={styles.ctaSecondary}>
                {slide.ctaSecondary.label}
              </Link>
            </div>

            <div className={styles.trustBadges}>
              {TRUST_BADGES.map((badge) => (
                <div key={badge.label} className={styles.trustItem}>
                  <badge.icon size={18} className={styles.trustIcon} />
                  <div>
                    <p className={styles.trustLabel}>{badge.label}</p>
                    <p className={styles.trustSub}>{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Image placeholder */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-img'}
            className={styles.imageWrapper}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.imagePlaceholder} data-metal={slide.imagePlaceholder}>
              <span className={styles.imageIcon}>
                {slide.imagePlaceholder === 'gold' ? '💍' : slide.imagePlaceholder === 'diamond' ? '💎' : '⭕'}
              </span>
              <p className={styles.imagePlaceholderText}>Jewellery Image</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={[styles.dot, i === current && styles['dot--active']].filter(Boolean).join(' ')}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
