'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Shield,
  Truck,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Share2,
  PackageSearch,
  BadgeCheck,
  Users,
  ShieldCheck,
  Package,
  Undo2,
  Headset,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { addItem, updateQuantity } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import { productApi } from '@/services/productApi';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button/Button';
import { isVariantOutOfStock } from '@/utils/inventory';
import styles from './ProductDetailPage.module.scss';

const formatWeight = (grams) => {
  const value = Number(grams ?? 0);
  return value > 0 ? `${value.toFixed(3).replace(/\.?0+$/, '')} gm` : 'Weight on request';
};

const weightRangeOf = (variants) => {
  const weights = variants.map((variant) => Number(variant.weightGrams ?? 0)).filter((value) => value > 0);
  if (!weights.length) return 'Weight on request';
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return min === max ? formatWeight(min) : `${formatWeight(min)} – ${formatWeight(max)}`;
};

const priceOf = (variant) => {
  const value = variant?.yourPrice ?? variant?.publicPrice;
  return value !== null && value !== undefined ? Number(value) : null;
};

// Same convention as VariantPickerSheet: a "Size" attribute value wins, then
// the variant's own name/purity, so weight-tier variants (e.g. "Light
// Weight") show their real label instead of a generic placeholder.
const variantLabel = (variant) => {
  const sizeValue = variant.attributeValues?.find((entry) => /size/i.test(entry.attribute?.name ?? ''));
  return sizeValue?.value || variant.name || variant.publicPurity || variant.purity || null;
};

// Flipkart-style hover zoom (desktop only): track the pointer as a % of the
// image box and use it as both the lens position and the zoomed pane's
// background-position.
function ZoomableImage({ src, alt }) {
  const wrapRef = useRef(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (event) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setPosition({ x, y });
  };

  return (
    <div
      ref={wrapRef}
      className={styles.zoomWrap}
      onMouseEnter={() => setZoomActive(true)}
      onMouseLeave={() => setZoomActive(false)}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.zoomClip}>
        {/* eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media */}
        <img src={src} alt={alt} className={styles.mainImageTag} />
      </div>
      {zoomActive ? (
        <span className={styles.zoomLens} style={{ left: `${position.x}%`, top: `${position.y}%` }} />
      ) : null}
      {zoomActive ? (
        <div
          className={styles.zoomPane}
          style={{ backgroundImage: `url(${src})`, backgroundPosition: `${position.x}% ${position.y}%` }}
        />
      ) : null}
    </div>
  );
}

const TRUST_FEATURES = [
  { icon: Users, title: 'B2B Exclusive', description: 'Special pricing for business partners' },
  { icon: ShieldCheck, title: 'Trusted Quality', description: 'Certified jewellery with assured purity' },
  { icon: Package, title: 'Secure Packaging', description: 'Safe and tamper-proof delivery' },
  { icon: Undo2, title: 'Easy Returns', description: 'Hassle-free returns within 7 days' },
];

const TABS = [
  { id: 'details', label: 'Product Details' },
  { id: 'purity', label: 'Purity & Care' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'returns', label: 'Returns' },
];

const PURITY_BULLETS = [
  '100% hallmarked purity, verified and certified.',
  'Store in a dry, soft-lined box away from direct sunlight.',
  'Clean gently with a soft cloth — avoid harsh chemicals and perfumes.',
];

const SHIPPING_BULLETS = [
  'Free delivery on all wholesale orders.',
  'Dispatched within 2–3 business days of confirmation.',
  'Fully insured, tamper-proof packaging on every shipment.',
];

const RETURNS_BULLETS = [
  '7 day easy return window from date of delivery.',
  'Item must be unused and in its original packaging.',
  'Refund or replacement processed within 5–7 business days.',
];

export default function ProductDetailPage({ slug }) {
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [resolvedProductId, setResolvedProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const wishlistItems = useSelector((s) => s.wishlist.items);

  // On mobile this page uses its own compact, contextual header (back +
  // share + wishlist) instead of the full storefront logo/search/account
  // bar — see the `.app-header` override in globals.scss.
  useEffect(() => {
    document.body.dataset.compactHeader = 'true';
    return () => {
      delete document.body.dataset.compactHeader;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await productApi.getBySlug(slug);
        if (!alive) return;
        setProduct(response.data);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [slug]);

  const activeVariants = (product?.variants ?? []).filter((variant) => variant.isActive !== false);
  const isVariable = activeVariants.length > 1;

  // Reset the selection when the product changes (React's "adjusting state
  // when a prop changes" pattern) — switching variants afterwards must not
  // snap the selection back to the default, so this only fires once per
  // distinct product id rather than on every render.
  if (product && product.id !== resolvedProductId) {
    setResolvedProductId(product.id);
    const initial = activeVariants.find((variant) => variant.isDefault) ?? activeVariants[0] ?? null;
    setSelectedVariantId(initial?.id ?? null);
    setActiveImage(0);
  }

  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? activeVariants[0] ?? null;
  const outOfStock = selectedVariant ? isVariantOutOfStock(selectedVariant) : true;

  const quantity = useSelector((state) =>
    selectedVariant ? state.cart.items.find((item) => item.id === selectedVariant.id)?.quantity ?? 0 : 0,
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <PackageSearch size={34} />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <PackageSearch size={34} />
          <h2>Product not found</h2>
          <p>This product may have been removed or is no longer available.</p>
          <Link href={ROUTES.PRODUCTS} className={styles.backLink}>← Back to Products</Link>
        </div>
      </div>
    );
  }

  const sortedImageRecords = (product.images ?? [])
    .slice()
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  // Images can be tagged to a specific variant (productVariantId). Prefer
  // that variant's own photos; fall back to the untagged/shared ones, and
  // only fall back to the full mixed pool if nothing is tagged at all.
  const imagesForVariant = (variantId) => {
    const scoped = sortedImageRecords.filter((image) => image.productVariantId === variantId);
    const shared = sortedImageRecords.filter((image) => image.productVariantId == null);
    const pool = scoped.length ? scoped : shared.length ? shared : sortedImageRecords;
    return pool.map((image) => image.media?.secureUrl).filter(Boolean);
  };

  const images = imagesForVariant(selectedVariant?.id);

  const metalName = product.metal?.name ?? null;
  const purityLabel = selectedVariant
    ? selectedVariant.publicPurity || selectedVariant.purity || (selectedVariant.publicKarat ? `${Number(selectedVariant.publicKarat)}K` : null)
    : null;

  const specWeightLabel = isVariable ? weightRangeOf(activeVariants) : formatWeight(selectedVariant?.weightGrams);
  const price = priceOf(selectedVariant);

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const detailBullets = product.description
    ? product.description.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    : [
        `Elegant ${product.name} with premium finishing.`,
        purityLabel && metalName ? `Crafted in ${purityLabel} ${metalName} with 100% hallmarked assurance.` : null,
        'Perfect for daily wear and festive occasions.',
      ].filter(Boolean);

  const TAB_CONTENT = {
    details: detailBullets,
    purity: PURITY_BULLETS,
    shipping: SHIPPING_BULLETS,
    returns: RETURNS_BULLETS,
  };

  const handleAddToCart = () => {
    if (outOfStock || !selectedVariant) return;
    dispatch(
      addItem({
        id: selectedVariant.id,
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        price,
        weight: Number(selectedVariant.weightGrams ?? 0),
        imageUrl: images[0] ?? null,
        metalName,
      }),
    );
  };

  const handleIncrement = () =>
    selectedVariant && dispatch(updateQuantity({ id: selectedVariant.id, quantity: quantity + 1 }));
  const handleDecrement = () =>
    selectedVariant && dispatch(updateQuantity({ id: selectedVariant.id, quantity: quantity - 1 }));

  const handleToggleWishlist = () => {
    dispatch(
      toggleWishlist({
        id: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: images[0] ?? null,
        purity: purityLabel ?? '—',
        weight: Number(selectedVariant?.weightGrams ?? 0),
        price,
        variants: product.variants ?? [],
        metalName,
      }),
    );
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareData = { title: product.name, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user dismissed the share sheet */
      }
      return;
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch {
        /* clipboard not permitted — nothing actionable to do */
      }
    }
  };

  const handleSwipeScroll = (event) => {
    const el = event.currentTarget;
    if (!el.clientWidth) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage((current) => (current === index ? current : index));
  };

  const selectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    setActiveImage(0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.mobileHeader}>
        <Link href={ROUTES.PRODUCTS} className={styles.mobileHeaderBtn} aria-label="Back to products">
          <ArrowLeft size={20} />
        </Link>
        <span className={styles.mobileHeaderTitle}>{product.name}</span>
        <div className={styles.mobileHeaderActions}>
          <button type="button" className={styles.mobileHeaderBtn} onClick={handleShare} aria-label="Share">
            <Share2 size={17} />
          </button>
          <button
            type="button"
            className={[styles.mobileHeaderBtn, isWishlisted && styles['mobileHeaderBtn--active']].filter(Boolean).join(' ')}
            onClick={handleToggleWishlist}
            aria-label="Wishlist"
          >
            <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href={ROUTES.HOME}>Home</Link><ChevronRight size={14} />
          <Link href={ROUTES.PRODUCTS}>Products</Link><ChevronRight size={14} />
          <span className={styles.breadcrumbActive}>{product.name}</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.imageSection}>
            <div className={styles.gallery}>
              {images.length > 1 ? (
                <div className={styles.thumbnails}>
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      className={[styles.thumb, index === activeImage && styles['thumb--active']].filter(Boolean).join(' ')}
                      onClick={() => setActiveImage(index)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media */}
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
              ) : null}

              <motion.div
                className={styles.mainImage}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <button
                  type="button"
                  className={styles.wishlistFloating}
                  onClick={handleToggleWishlist}
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>

                {images.length ? (
                  <>
                    <div className={styles.swipeTrack} onScroll={handleSwipeScroll}>
                      {images.map((image) => (
                        <div className={styles.swipeSlide} key={image}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media */}
                          <img src={image} alt={product.name} className={styles.mainImageTag} />
                        </div>
                      ))}
                    </div>

                    {images.length > 1 ? (
                      <div className={styles.dots} aria-hidden="true">
                        {images.map((image, index) => (
                          <span
                            key={image}
                            className={[styles.dot, index === activeImage && styles['dot--active']].filter(Boolean).join(' ')}
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.desktopImage}>
                      <ZoomableImage src={images[activeImage] ?? images[0]} alt={product.name} />
                    </div>
                  </>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.imageEmoji}>✦</span>
                  </div>
                )}
              </motion.div>
            </div>

            {isVariable ? (
              <div className={styles.variantSection}>
                <span className={styles.variantSectionLabel}>Select Variant</span>
                <div className={styles.variantRow}>
                  {activeVariants.map((variant) => {
                    const variantOOS = isVariantOutOfStock(variant);
                    const label = variantLabel(variant);
                    const active = variant.id === selectedVariantId;
                    return (
                      <button
                        type="button"
                        key={variant.id}
                        className={[
                          styles.variantSwatch,
                          active && styles['variantSwatch--active'],
                          variantOOS && styles['variantSwatch--oos'],
                        ].filter(Boolean).join(' ')}
                        onClick={() => selectVariant(variant.id)}
                      >
                        {variantOOS ? <span className={styles.variantOosDot} aria-hidden="true" /> : null}
                        <span className={styles.variantSwatchWeight}>{formatWeight(variant.weightGrams)}</span>
                        {label ? <span className={styles.variantSwatchLabel}>{label}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={styles.badgeRow}>
              {metalName ? <span className={styles.metal}>{metalName}</span> : null}
              <span className={styles.hallmarkBadge}><BadgeCheck size={13} /> Hallmarked</span>
              {outOfStock ? <span className={styles.outOfStockTag}>Out of Stock</span> : null}
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            {price !== null ? (
              <div className={styles.priceBlock}>
                <span className={styles.price}>₹{price.toLocaleString('en-IN')}</span>
              </div>
            ) : null}

            <div className={styles.specs}>
              <div className={styles.spec}><span>Metal</span><strong>{metalName ?? '—'}</strong></div>
              <div className={styles.spec}><span>Purity</span><strong>{purityLabel ?? '—'}</strong></div>
              <div className={styles.spec}><span>{isVariable ? 'Weight Range' : 'Weight'}</span><strong>{specWeightLabel}</strong></div>
            </div>

            <div className={styles.actionRow}>
              {!outOfStock && quantity > 0 ? (
                <div className={styles.qtyControl}>
                  <button onClick={handleDecrement} className={styles.qtyBtn} aria-label="Decrease quantity">
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button onClick={handleIncrement} className={styles.qtyBtn} aria-label="Increase quantity">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <Button
                  disabled={outOfStock}
                  fullWidth
                  icon={<ShoppingBag size={18} />}
                  size="lg"
                  onClick={handleAddToCart}
                >
                  {outOfStock ? 'Out of Stock' : 'Add to Quick Order'}
                </Button>
              )}
              <button
                className={[styles.wishlistBtn, isWishlisted && styles['wishlistBtn--active']].filter(Boolean).join(' ')}
                onClick={handleToggleWishlist}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className={styles.deliveryBadges}>
              <div className={styles.deliveryBadge}><Shield size={16} /><span>100% Hallmarked</span></div>
              <div className={styles.deliveryBadge}><Truck size={16} /><span>Free Delivery</span></div>
              <div className={styles.deliveryBadge}><RefreshCw size={16} /><span>7 Day Returns</span></div>
            </div>
          </motion.div>
        </div>

        <div className={styles.trustGrid}>
          {TRUST_FEATURES.map((feature) => (
            <div key={feature.title} className={styles.trustCard}>
              <span className={styles.trustIcon}><feature.icon size={20} strokeWidth={1.5} /></span>
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.tabsSection}>
          <div className={styles.tabNav} role="tablist">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={[styles.tabBtn, activeTab === tab.id && styles['tabBtn--active']].filter(Boolean).join(' ')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.tabBody}>
            <ul className={styles.tabContent}>
              {TAB_CONTENT[activeTab].map((line) => (
                <li key={line}>
                  <Check size={15} strokeWidth={2.5} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className={styles.supportCard}>
              <span className={styles.supportIcon}><Headset size={22} strokeWidth={1.5} /></span>
              <strong>Need help?</strong>
              <p>Our team is here to assist you</p>
              <Link href="/support" className={styles.supportBtn}>Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
