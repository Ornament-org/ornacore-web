'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductFilters from '../components/ProductFilters/ProductFilters';
import styles from './ProductsPage.module.scss';

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: ['Gold Chain Necklace', 'Diamond Solitaire Ring', 'Silver Bangle Set', 'Ruby Pendant', 'Pearl Earrings', 'Gold Jhumka', 'Platinum Ring', 'Kundan Necklace'][i % 8],
  price: Math.floor(8000 + Math.random() * 80000),
  originalPrice: Math.random() > 0.5 ? Math.floor(12000 + Math.random() * 90000) : undefined,
  rating: (4.2 + Math.random() * 0.8).toFixed(1),
  reviewCount: Math.floor(20 + Math.random() * 200),
  badge: i % 7 === 0 ? 'New' : i % 9 === 0 ? 'Sale' : undefined,
}));

export default function ProductsPage() {
  const [filters, setFilters] = useState({ metal: 'All', category: 'All', sort: 'popular' });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>All Jewellery</h1>
          <p className={styles.count}>{MOCK_PRODUCTS.length} products</p>
        </div>

        <ProductFilters filters={filters} onChange={setFilters} />

        <div className={styles.grid}>
          {MOCK_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
