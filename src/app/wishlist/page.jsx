'use client';
import { useSelector } from 'react-redux';
import { Heart, PackageSearch } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import ProductCardB2B from '@/features/home/components/ProductCardB2B/ProductCardB2B';
import styles from './wishlist.module.scss';

const toCardProduct = (item) => ({
  ...item,
  imageUrl: item.imageUrl ?? item.image ?? null,
  purity: item.purity ?? '—',
  weight: Number(item.weight ?? 0),
  price: item.price ?? null,
});

export default function WishlistPage() {
  const items = useSelector((s) => s.wishlist.items);

  return (
    <main className={styles.page}>
      <div className={styles.headingRow}>
        <h1>My Wishlist</h1>
        <p>{items.length} saved products</p>
      </div>

      <div className={styles.content}>
        {items.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title="Your wishlist is empty"
            description="Save products from the catalog to review them later."
          />
        ) : (
          <div className={styles.grid}>
            {items.map((item) => <ProductCardB2B key={item.id} product={toCardProduct(item)} />)}
          </div>
        )}
        {!items.length ? <PackageSearch className={styles.bgIcon} size={120} /> : null}
      </div>
    </main>
  );
}
