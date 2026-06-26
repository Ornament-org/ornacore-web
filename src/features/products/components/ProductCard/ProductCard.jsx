'use client';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import { addItem } from '@/redux/slices/cartSlice';
import { ROUTES } from '@/constants/routes';
import styles from './ProductCard.module.scss';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i.id === product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image }));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addItem({ id: product.id, name: product.name, price: product.price, image: product.image }));
  };

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder}>
          <span className={styles.imageIcon}>💍</span>
        </div>
        <button
          className={[styles.wishlistBtn, isWishlisted && styles['wishlistBtn--active']].filter(Boolean).join(' ')}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <div className={styles.quickAdd} onClick={handleAddToCart}>Add to Cart</div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.rating && (
          <div className={styles.ratingRow}>
            <Star size={12} className={styles.starIcon} fill="currentColor" />
            <span className={styles.rating}>{product.rating}</span>
            {product.reviewCount && <span className={styles.reviews}>({product.reviewCount})</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
