'use client';
import { useSelector, useDispatch } from 'react-redux';
import { Heart } from 'lucide-react';
import { removeFromWishlist } from '@/redux/slices/wishlistSlice';
import { addItem } from '@/redux/slices/cartSlice';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import ProductCard from '@/features/products/components/ProductCard/ProductCard';

export default function WishlistPage() {
  const items = useSelector((s) => s.wishlist.items);

  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.25rem', fontWeight: 600, marginBottom: '2rem' }}>
          My Wishlist ({items.length})
        </h1>
        {items.length === 0 ? (
          <EmptyState icon={<Heart />} title="Your wishlist is empty" description="Save items you love to come back to them later." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {items.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
