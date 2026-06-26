'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Shield, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import { addItem } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import Button from '@/components/ui/Button/Button';
import styles from './ProductDetailPage.module.scss';

const MOCK_PRODUCT = {
  id: 1,
  name: 'Floral Gold Necklace with Diamond Accents',
  price: 78250,
  originalPrice: 85000,
  metal: 'Gold',
  purity: '22K',
  weight: '18.5g',
  rating: 4.9,
  reviewCount: 128,
  description: 'An exquisite floral gold necklace crafted with precision and care. Features intricate floral patterns with diamond accents set in 22K gold. Perfect for weddings and special occasions.',
  badge: 'Bestseller',
};

export default function ProductDetailPage({ id }) {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i.id === MOCK_PRODUCT.id);

  const handleAddToCart = () => {
    dispatch(addItem({ ...MOCK_PRODUCT, quantity: qty }));
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Home</span><ChevronRight size={14} />
          <span>Products</span><ChevronRight size={14} />
          <span className={styles.breadcrumbActive}>{MOCK_PRODUCT.name}</span>
        </div>

        <div className={styles.grid}>
          {/* Images */}
          <div className={styles.imageSection}>
            <motion.div
              className={styles.mainImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className={styles.imagePlaceholder}>
                <span className={styles.imageEmoji}>💍</span>
              </div>
              {MOCK_PRODUCT.badge && <span className={styles.imageBadge}>{MOCK_PRODUCT.badge}</span>}
            </motion.div>
            <div className={styles.thumbnails}>
              {[1, 2, 3, 4].map((t) => (
                <div key={t} className={styles.thumb}>
                  <span style={{ fontSize: '1.5rem' }}>💍</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className={styles.metal}>{MOCK_PRODUCT.metal} · {MOCK_PRODUCT.purity}</span>
            <h1 className={styles.name}>{MOCK_PRODUCT.name}</h1>

            <div className={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={styles.star} fill="currentColor" />
              ))}
              <span className={styles.ratingText}>{MOCK_PRODUCT.rating} ({MOCK_PRODUCT.reviewCount} reviews)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>₹{MOCK_PRODUCT.price.toLocaleString('en-IN')}</span>
              {MOCK_PRODUCT.originalPrice && (
                <span className={styles.originalPrice}>₹{MOCK_PRODUCT.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {MOCK_PRODUCT.originalPrice && (
                <span className={styles.discount}>
                  {Math.round((1 - MOCK_PRODUCT.price / MOCK_PRODUCT.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            <div className={styles.specs}>
              <div className={styles.spec}><span>Metal</span><strong>{MOCK_PRODUCT.metal}</strong></div>
              <div className={styles.spec}><span>Purity</span><strong>{MOCK_PRODUCT.purity}</strong></div>
              <div className={styles.spec}><span>Weight</span><strong>{MOCK_PRODUCT.weight}</strong></div>
            </div>

            <p className={styles.description}>{MOCK_PRODUCT.description}</p>

            {/* Qty + Add to cart */}
            <div className={styles.qtyRow}>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className={styles.qtyBtn}>−</button>
                <span className={styles.qtyValue}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className={styles.qtyBtn}>+</button>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Button size="lg" fullWidth onClick={handleAddToCart} icon={<ShoppingBag size={18} />}>
                Add to Cart
              </Button>
              <button
                className={[styles.wishlistBtn, isWishlisted && styles['wishlistBtn--active']].filter(Boolean).join(' ')}
                onClick={() => dispatch(toggleWishlist(MOCK_PRODUCT))}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Delivery badges */}
            <div className={styles.deliveryBadges}>
              <div className={styles.deliveryBadge}><Shield size={16} /><span>100% Hallmarked</span></div>
              <div className={styles.deliveryBadge}><Truck size={16} /><span>Free Delivery</span></div>
              <div className={styles.deliveryBadge}><RefreshCw size={16} /><span>7 Day Returns</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
