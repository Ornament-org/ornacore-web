'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './CategorySection.module.scss';

const CATEGORIES = [
  { id: 1, label: 'Gold Jewellery', icon: '💛', href: `${ROUTES.PRODUCTS}?metal=gold` },
  { id: 2, label: 'Diamond Jewellery', icon: '💎', href: `${ROUTES.PRODUCTS}?metal=diamond` },
  { id: 3, label: 'Silver Jewellery', icon: '⬡', href: `${ROUTES.PRODUCTS}?metal=silver` },
  { id: 4, label: 'Wedding Collection', icon: '💍', href: `${ROUTES.CATEGORIES}?tag=wedding` },
  { id: 5, label: 'Bangles & Bracelets', icon: '○', href: `${ROUTES.PRODUCTS}?category=bangles` },
  { id: 6, label: 'Earrings', icon: '◇', href: `${ROUTES.PRODUCTS}?category=earrings` },
  { id: 7, label: 'Pendants', icon: '◈', href: `${ROUTES.PRODUCTS}?category=pendants` },
  { id: 8, label: 'Rings', icon: '◯', href: `${ROUTES.PRODUCTS}?category=rings` },
];

export default function CategorySection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Shop By Category</h2>
          <Link href={ROUTES.CATEGORIES} className={styles.viewAll}>
            View All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.grid}>
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={cat.href} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{cat.icon}</span>
                </div>
                <span className={styles.label}>{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
