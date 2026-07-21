'use client';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ArrowRight, Scale, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './FloatingCartBar.module.scss';

const formatWeight = (grams) => {
  const value = Number(grams) || 0;
  return `${value.toFixed(value < 10 ? 3 : 2).replace(/\.?0+$/, '')} g`;
};

// Persistent B2B order summary — jewellery orders are quoted by weight, not
// just item count, so this stays visible (floating above BottomNav) any time
// there's something in the cart, keeping the running gram total in view no
// matter which product/category listing the shopkeeper is browsing.
export default function FloatingCartBar() {
  const { count, totalWeight } = useSelector((state) => state.cart);

  if (!count) return null;

  return (
    <Link href={ROUTES.CART} className={styles.bar}>
      <span className={styles.icon}>
        <ShoppingBag size={18} strokeWidth={2} />
      </span>
      <span className={styles.summary}>
        <strong>
          {count} {count === 1 ? 'Product' : 'Products'}
        </strong>
        <span className={styles.weight}>
          <Scale size={12} strokeWidth={2} />
          {formatWeight(totalWeight)} total
        </span>
      </span>
      <span className={styles.cta}>
        View Cart <ArrowRight size={15} />
      </span>
    </Link>
  );
}
