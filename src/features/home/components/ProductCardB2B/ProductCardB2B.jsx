'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateQuantity } from '@/redux/slices/cartSlice';
import { ROUTES } from '@/constants/routes';
import { isProductOutOfStock, isVariantOutOfStock } from '@/utils/inventory';
import { cardBadgeLabel } from '@/utils/tunch';
import { useMetalTheme } from '../../context/MetalThemeContext';
import VariantPickerSheet from '../VariantPickerSheet/VariantPickerSheet';
import styles from './ProductCardB2B.module.scss';

const formatWeight = (grams) => `${Number(grams).toFixed(3).replace(/\.?0+$/, '')} gm`;

const weightRangeOf = (variants) => {
  const weights = variants.map((variant) => Number(variant.weightGrams ?? 0)).filter((value) => value > 0);
  if (!weights.length) return 'Weight on request';
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return min === max ? formatWeight(min) : `${formatWeight(min)} – ${formatWeight(max)}`;
};

export default function ProductCardB2B({ product }) {
  const { metal } = useMetalTheme();
  const dispatch = useDispatch();
  const [pickerOpen, setPickerOpen] = useState(false);

  // A product with more than one active variant (e.g. Small/Large) can't be
  // added with a single tap — which size goes in the cart? Those open the
  // picker sheet instead; a single-variant product keeps the direct
  // add-then-stepper behavior this card always had.
  const activeVariants = (product.variants ?? []).filter((variant) => variant.isActive !== false);
  const isVariable = activeVariants.length > 1;
  const singleVariant = !isVariable ? activeVariants[0] : null;
  const cartLineId = singleVariant ? singleVariant.id : product.id;
  const outOfStock = isVariable ? isProductOutOfStock(activeVariants) : isVariantOutOfStock(singleVariant);

  const quantity = useSelector((state) =>
    isVariable ? 0 : state.cart.items.find((item) => item.id === cartLineId)?.quantity ?? 0,
  );

  const weightLabel = isVariable
    ? weightRangeOf(activeVariants)
    : Number.isFinite(product.weight) && product.weight > 0
      ? formatWeight(product.weight)
      : 'Weight on request';

  const stopAndRun = (fn) => (event) => {
    event.preventDefault();
    fn();
  };

  const handleAddClick = stopAndRun(() => {
    if (outOfStock) return;
    if (isVariable) {
      setPickerOpen(true);
      return;
    }
    dispatch(
      addItem({
        id: cartLineId,
        variantId: singleVariant?.id ?? undefined,
        productId: product.id,
        productSlug: product.slug ?? null,
        name: product.name,
        price: product.price,
        weight: product.weight,
        imageUrl: product.imageUrl,
        metalName: product.metalName ?? null,
      }),
    );
  });
  const handleIncrement = stopAndRun(() => dispatch(updateQuantity({ id: cartLineId, quantity: quantity + 1 })));
  const handleDecrement = stopAndRun(() => dispatch(updateQuantity({ id: cartLineId, quantity: quantity - 1 })));

  return (
    <>
      <Link
        href={ROUTES.PRODUCT_DETAIL(product.slug ?? product.id)}
        className={[styles.card, outOfStock && styles['card--outOfStock']].filter(Boolean).join(' ')}
      >
        <div className={styles.imageWrapper} style={product.imageUrl ? undefined : { background: metal.gradient }}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable, not a fixed remote-pattern domain
            <img className={styles.image} src={product.imageUrl} alt="" />
          ) : null}
          {outOfStock ? (
            <span className={styles.outOfStockBadge}>Out of Stock</span>
          ) : (
            <span className={styles.purityTag}>{cardBadgeLabel(product.tunch, product.purity)}</span>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.name}>{product.name}</p>
          {!isVariable ? <p className={styles.weight}>{weightLabel}</p> : null}
          <div className={styles.footer}>
            <span className={styles.price}>
              {product.price !== null ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on request'}
            </span>
            {outOfStock ? (
              <button type="button" className={styles.addBtn} disabled aria-label={`${product.name} is out of stock`}>
                Out of Stock
              </button>
            ) : !isVariable && quantity > 0 ? (
              <div className={styles.stepper}>
                <button type="button" onClick={handleDecrement} aria-label={`Remove one ${product.name}`}>
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={handleIncrement} aria-label={`Add one more ${product.name}`}>
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddClick}
                aria-label={isVariable ? `Choose a size for ${product.name}` : `Add ${product.name}`}
              >
                <Plus size={16} strokeWidth={2.5} />
                {weightLabel}
              </button>
            )}
          </div>
        </div>
      </Link>

      {isVariable ? (
        <VariantPickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          product={product}
          variants={activeVariants}
        />
      ) : null}
    </>
  );
}
