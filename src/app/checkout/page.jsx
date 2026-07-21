'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PackageSearch, Info } from 'lucide-react';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { clearCart } from '@/redux/slices/cartSlice';
import { productApi } from '@/services/productApi';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { ROUTES } from '@/constants/routes';
import styles from './checkout.module.scss';

const INITIAL_ADDRESS = { fullName: '', mobile: '', pincode: '', city: '', address: '', state: '' };

const extractMessage = (err) =>
  err?.error?.message || err?.response?.data?.error?.message || err?.message || 'Something went wrong';

const formatWeight = (grams) => `${Number(grams).toFixed(3).replace(/\.?0+$/, '')} g`;

// Prices float with the live metal rate, so checkout — like the cart —
// commits only to weight, broken out per metal since gold and silver don't
// share a rate.
const weightByMetal = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.metalName || 'Other';
    groups.set(key, (groups.get(key) ?? 0) + (Number(item.weight) || 0) * item.quantity);
  });
  return Array.from(groups.entries());
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, total, totalWeight } = useSelector((s) => s.cart);
  const delivery = total > 5000 ? 0 : 99;
  const metalWeights = weightByMetal(items);
  const showPerMetal = metalWeights.length > 1;

  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadProfile = async () => {
      try {
        const response = await shopkeeperApi.getProfile();
        if (!alive) return;
        const profile = response.data;
        setAddress({
          fullName: profile.ownerName || '',
          mobile: profile.user?.mobile || '',
          pincode: profile.pincode || '',
          city: profile.city || '',
          address: [profile.addressLine1, profile.addressLine2].filter(Boolean).join(', '),
          state: profile.state || '',
        });
      } catch {
        // Prefill is a convenience, not a requirement — leave the form blank
        // and let the shopkeeper fill it in manually if this fails.
      } finally {
        if (alive) setLoadingProfile(false);
      }
    };

    void loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const setField = (key) => (event) => setAddress((current) => ({ ...current, [key]: event.target.value }));

  const handlePlaceOrder = async () => {
    if (!items.length || placing) return;
    setError('');

    if (!address.fullName.trim() || !address.mobile.trim() || !address.address.trim()
      || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setError('Please fill in the full delivery address before placing the order.');
      return;
    }

    setPlacing(true);
    try {
      // The shopkeeper-facing order endpoint converts whatever is sitting in
      // the shopkeeper's server-side cart (carts/cart-items tables) — it has
      // no concept of the cart kept in this app's local Redux store, so that
      // local cart has to be pushed up as real cart items first.
      for (const item of items) {
        // Cards that offer a size/variant picker already know exactly which
        // variant was added (item.variantId) — only items added through a
        // path that never resolved one (e.g. from the wishlist) need a
        // lookup here, falling back to that product's default variant.
        let variantId = item.variantId;
        if (!variantId) {
          if (!item.productSlug) {
            throw new Error(`${item.name} is no longer available.`);
          }
          const productResponse = await productApi.getBySlug(item.productSlug);
          const product = productResponse.data;
          const variant = product?.variants?.find((v) => v.isDefault) ?? product?.variants?.[0];
          if (!variant) {
            throw new Error(`${item.name} is no longer available.`);
          }
          variantId = variant.id;
        }
        await shopkeeperApi.addToCart({ productVariantId: variantId, quantity: item.quantity });
      }

      // There's no structured delivery-address field on the order yet — the
      // backend only accepts free-text `notes` (shopkeeperPlaceOrderSchema) —
      // so the address is included there rather than silently discarded.
      const deliveryNote = [
        'Delivery Address:',
        `${address.fullName}, ${address.mobile}`,
        address.address,
        `${address.city}, ${address.state} - ${address.pincode}`,
      ].join('\n');

      await shopkeeperApi.placeOrder({ notes: deliveryNote });

      dispatch(clearCart());
      router.push(ROUTES.ORDERS);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <main className={styles.page}>
        <div className={styles.headingRow}>
          <h1>Checkout</h1>
        </div>
        <section className={styles.emptyState}>
          <PackageSearch size={38} />
          <h2>Your cart is empty</h2>
          <p>Add products to your cart before checking out.</p>
          <Link href={ROUTES.PRODUCTS}>Browse Products</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.headingRow}>
        <h1>Checkout</h1>
        <p>Confirm delivery details and place your order.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.formStack}>
          <section className={styles.card}>
            <h2>Delivery Address</h2>
            {loadingProfile ? <p className={styles.prefillHint}>Loading your shop details…</p> : null}
            <div className={styles.formGrid}>
              <Input label="Full Name" placeholder="Your name" value={address.fullName} onChange={setField('fullName')} />
              <Input label="Mobile" placeholder="+91 98765 43210" value={address.mobile} onChange={setField('mobile')} />
              <Input label="Pincode" placeholder="400001" value={address.pincode} onChange={setField('pincode')} />
              <Input label="City" placeholder="Mumbai" value={address.city} onChange={setField('city')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  label="Full Address"
                  placeholder="House/Flat, Street, Area"
                  value={address.address}
                  onChange={setField('address')}
                />
              </div>
              <Input label="State" placeholder="Maharashtra" value={address.state} onChange={setField('state')} />
            </div>
          </section>
        </div>

        <aside className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRows}>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryRow}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatWeight((Number(item.weight) || 0) * item.quantity)}</span>
              </div>
            ))}
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
            Weight shown is approximate — the final weight and amount will be confirmed on your invoice based on the
            exact piece weight and live rate at billing.
          </p>
          <p className={styles.summaryFootnote}>
            Thank you for your order — our team will reach out if anything needs confirming before your invoice is
            prepared.
          </p>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <Button fullWidth size="lg" onClick={handlePlaceOrder} loading={placing}>
            Place Order
          </Button>
          <Link href={ROUTES.CART} className={styles.backLink}>← Back to Cart</Link>
        </aside>
      </div>
    </main>
  );
}
