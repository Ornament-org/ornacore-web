'use client';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { removeItem, updateQuantity } from '@/redux/slices/cartSlice';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { ROUTES } from '@/constants/routes';
import styles from './CartPage.module.scss';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, total } = useSelector((s) => s.cart);

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
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

  const gst = Math.round(total * 0.03);
  const delivery = total > 5000 ? 0 : 99;

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  <span className={styles.itemEmoji}>💍</span>
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</p>
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
              <div className={styles.summaryRow}><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              <div className={styles.summaryRow}><span>GST (3%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
              <div className={styles.summaryRow}><span>Delivery</span><span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
              <div className={[styles.summaryRow, styles['summaryRow--total']].join(' ')}>
                <span>Total</span>
                <span>₹{(total + gst + delivery).toLocaleString('en-IN')}</span>
              </div>
            </div>
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
