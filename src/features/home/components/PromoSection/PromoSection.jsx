'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './PromoSection.module.scss';

const PROMOS = [
  {
    id: 1,
    tag: 'Limited Time',
    title: 'Wedding Season Collection',
    subtitle: 'Celebrate your special moments with our exclusive designs',
    cta: { label: 'Shop Now', href: `${ROUTES.CATEGORIES}?tag=wedding` },
    theme: 'light',
    emoji: '💍',
  },
  {
    id: 2,
    tag: 'Transparent Pricing',
    title: 'Making Charges Starting at 5%',
    subtitle: 'On selected gold jewellery',
    cta: { label: 'Shop Now', href: `${ROUTES.PRODUCTS}?metal=gold` },
    theme: 'gold',
    emoji: '⭕',
  },
];

export default function PromoSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {PROMOS.map((promo, i) => (
            <motion.div
              key={promo.id}
              className={[styles.card, styles[`card--${promo.theme}`]].join(' ')}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className={styles.cardContent}>
                <span className={styles.tag}>{promo.tag}</span>
                <h3 className={styles.title}>{promo.title}</h3>
                <p className={styles.subtitle}>{promo.subtitle}</p>
                <Link href={promo.cta.href} className={styles.cta}>
                  {promo.cta.label} <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.cardImage}>
                <span className={styles.imageEmoji}>{promo.emoji}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
