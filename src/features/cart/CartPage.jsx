'use client';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Trash2, ShoppingBag, Info } from 'lucide-react';
import { removeItem, updateQuantity } from '@/redux/slices/cartSlice';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { ROUTES } from '@/constants/routes';
import styles from './CartPage.module.scss';

const formatWeight = (grams) => `${Number(grams).toFixed(3).replace(/\.?0+$/, '')} g`;

// Prices here float with the live metal rate, so the summary only commits to
// what's actually fixed at cart time — the weight. Gold and silver are
// tracked separately since they don't share a rate.
const weightByMetal = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.metalName || 'Other';
    groups.set(key, (groups.get(key) ?? 0) + (Number(item.weight) || 0) * item.quantity);
  });
  return Array.from(groups.entries());
};

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, total, totalWeight } = useSelector((s) => s.cart);

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <EmptyState
            icon={<ShoppingBag />}
            title="Your cart is empty"
            description="Discover our exquisite jewellery collection and add your favourites."
            action={() => {}}
            actionLabel="Start Shopping"
          />
        </div>
      </div>
    );
  }

  const delivery = total > 5000 ? 0 : 99;
  const metalWeights = weightByMetal(items);
  const showPerMetal = metalWeights.length > 1;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Shopping Cart</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- cart image host follows product/toolbox media configuration
                    <img src={item.imageUrl} alt="" />
                  ) : (
                    <span className={styles.itemEmoji}>✦</span>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</p>
                  {Number(item.weight) > 0 ? (
                    <p className={styles.itemWeight}>{Number(item.weight).toFixed(3).replace(/\.?0+$/, '')} g</p>
                  ) : null}
                </div>
                <div className={styles.itemControls}>
                  <div className={styles.qtyControl}>
                    <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
                  </div>
                  <p className={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  <button className={styles.removeBtn} onClick={() => dispatch(removeItem(item.id))}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRows}>
              {showPerMetal ? (
                metalWeights.map(([metalName, weight]) => (
                  <div className={styles.summaryRow} key={metalName}>
                    <span>{metalName} Weight</span>
                    <span>{formatWeight(weight)}</span>
                  </div>
                ))
              ) : (
                <div className={styles.summaryRow}>
                  <span>Total Weight</span>
                  <span>{formatWeight(totalWeight)}</span>
                </div>
              )}
              <div className={[styles.summaryRow, styles['summaryRow--total']].join(' ')}>
                <span>Delivery</span>
                <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
              </div>
            </div>

            <p className={styles.weightNotice}>
              <Info size={14} strokeWidth={2} />
              Weight shown is approximate — the final weight and amount will be confirmed on your invoice based on
              the exact piece weight and live rate at billing.
            </p>
            <p className={styles.summaryFootnote}>
              Thank you for your order — our team will reach out if anything needs confirming before your invoice is
              prepared.
            </p>

            <Link href={ROUTES.CHECKOUT}>
              <Button fullWidth size="lg">Proceed to Checkout</Button>
            </Link>
            <Link href={ROUTES.PRODUCTS} className={styles.continueShopping}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
