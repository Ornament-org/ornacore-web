'use client';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Bell, LogOut, ShoppingCart } from 'lucide-react';
import { logoutUser } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';
import ThemeToggle from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './AccountHeader.module.scss';

// Shared top bar for every page under Account — Profile, My Orders, Order
// Details, etc. — so moving between them feels like one section instead of
// jumping between different chrome each time.
export default function AccountHeader({
  title,
  description,
  backHref = ROUTES.PROFILE,
  backLabel = 'Profile',
  onBack,
}) {
  const dispatch = useDispatch();
  const cartCount = useSelector((state) => state.cart.count);

  return (
    <section className={styles.topBar} aria-label="Account shortcuts">
      <div>
        {/* Account sub-views (Transactions, Orders…) are in-page tabs, not
            routes — a plain Link back to the same URL would be a no-op, so
            those pass an onBack handler that switches the tab instead. */}
        {onBack ? (
          <button type="button" className={styles.backLink} onClick={onBack}>
            <ArrowLeft size={20} />
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className={styles.backLink}>
            <ArrowLeft size={20} />
            {backLabel}
          </Link>
        )}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div className={styles.actionGroup}>
        <ThemeToggle className={styles.iconButton} />
        <button className={styles.iconButton} type="button" aria-label="Notifications">
          <Bell size={23} />
        </button>
        <Link className={styles.iconButton} href={ROUTES.CART} aria-label="Cart">
          <ShoppingCart size={23} />
          {cartCount > 0 ? <span>{cartCount}</span> : null}
        </Link>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="Logout"
          onClick={() => dispatch(logoutUser())}
        >
          <LogOut size={24} />
        </button>
      </div>
    </section>
  );
}
