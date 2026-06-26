'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import ProductCard from '@/features/products/components/ProductCard/ProductCard';
import styles from './BestSellers.module.scss';

const BEST_SELLERS = [
  { id: 1, name: 'Floral Gold Necklace', price: 78250, originalPrice: 82000, rating: 4.9, reviewCount: 128, badge: 'Bestseller' },
  { id: 2, name: 'Classic Gold Bangles', price: 56220, originalPrice: 60000, rating: 4.8, reviewCount: 96 },
  { id: 3, name: 'Solitaire Diamond Ring', price: 45680, rating: 4.9, reviewCount: 210, badge: 'New' },
  { id: 4, name: 'Traditional Jhumka', price: 32450, rating: 4.8, reviewCount: 75 },
  { id: 5, name: 'Diamond Pendant', price: 28750, rating: 4.7, reviewCount: 64 },
];

export default function BestSellers() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Best Sellers</h2>
          <Link href={ROUTES.PRODUCTS} className={styles.viewAll}>
            View All Products <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.grid}>
          {BEST_SELLERS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
