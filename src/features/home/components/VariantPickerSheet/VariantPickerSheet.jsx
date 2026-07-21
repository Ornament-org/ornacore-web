'use client';
import { useEffect } from 'react';
import { Gem, Minus, Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateQuantity } from '@/redux/slices/cartSlice';
import { isVariantOutOfStock } from '@/utils/inventory';
import styles from './VariantPickerSheet.module.scss';

// Prefer an image specifically attached to this variant, falling back to the
// product's main image so every row still shows a thumbnail.
const variantImage = (product, variant) => {
  const own = product.images?.find((image) => String(image.productVariantId) === String(variant.id));
  return own?.media?.secureUrl ?? own?.url ?? product.imageUrl ?? null;
};

// A variant's "size" is whichever of its attribute values belongs to an
// attribute literally named Size — falls back to the variant's own free-text
// name, then purity, rather than showing nothing if a shop hasn't used a
// "Size" attribute for this product's variation.
const variantLabel = (variant) => {
  const sizeValue = variant.attributeValues?.find((entry) => /size/i.test(entry.attribute?.name ?? ''));
  return sizeValue?.value || variant.name || variant.publicPurity || variant.purity || `Option ${variant.id}`;
};

const formatWeight = (grams) => {
  const value = Number(grams ?? 0);
  return value > 0 ? `${value.toFixed(3).replace(/\.?0+$/, '')} gm` : 'Weight on request';
};

function VariantRow({ product, variant }) {
  const dispatch = useDispatch();
  const quantity = useSelector((state) => state.cart.items.find((item) => item.id === variant.id)?.quantity ?? 0);
  const price = variant.yourPrice ?? variant.publicPrice;
  const label = variantLabel(variant);
  const outOfStock = isVariantOutOfStock(variant);
  const image = variantImage(product, variant);
  const weightLabel = formatWeight(variant.weightGrams);

  const handleAdd = () => {
    if (outOfStock) return;
    dispatch(
      addItem({
        id: variant.id,
        variantId: variant.id,
        productId: product.id,
        productSlug: product.slug ?? null,
        name: `${product.name} — ${label}`,
        variantLabel: label,
        price: price !== null && price !== undefined ? Number(price) : null,
        weight: Number(variant.weightGrams ?? 0),
        imageUrl: image,
        metalName: product.metalName ?? null,
      }),
    );
  };
  const handleIncrement = () => dispatch(updateQuantity({ id: variant.id, quantity: quantity + 1 }));
  const handleDecrement = () => dispatch(updateQuantity({ id: variant.id, quantity: quantity - 1 }));

  return (
    <div className={[styles.row, outOfStock && styles['row--outOfStock']].filter(Boolean).join(' ')}>
      <span className={styles.rowThumb}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media
          <img src={image} alt="" />
        ) : (
          <Gem size={20} strokeWidth={1.5} />
        )}
      </span>
      <div className={styles.rowInfo}>
        <strong>{label}</strong>
        <span>{outOfStock ? 'Out of Stock' : weightLabel}</span>
      </div>
      <div className={styles.rowRight}>
        {outOfStock ? (
          <button type="button" className={styles.oosBtn} disabled aria-label={`${label} is out of stock`}>
            Out of Stock
          </button>
        ) : quantity > 0 ? (
          <div className={styles.stepper}>
            <button type="button" onClick={handleDecrement} aria-label={`Remove one ${label}`}>
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={handleIncrement} aria-label={`Add one more ${label}`}>
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button type="button" className={styles.addBtn} onClick={handleAdd} aria-label={`Add ${label} (${weightLabel})`}>
            <span>{weightLabel}</span>
            <Plus size={15} strokeWidth={2.7} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function VariantPickerSheet({ open, onClose, product, variants }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <span className={styles.grabber} aria-hidden="true" />
        <div className={styles.header}>
          <div>
            <h2>{product.name}</h2>
            <p>Choose a size</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {variants.map((variant) => (
            <VariantRow key={variant.id} product={product} variant={variant} />
          ))}
        </div>
      </div>
    </div>
  );
}
