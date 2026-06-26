'use client';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './B2BOrdersPage.module.scss';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];

const MOCK_ORDERS = [
  { id: 'ORD-001', date: '15 Jun 2026', items: 5, amount: 45200, status: 'Delivered', products: 'Gold Necklace, Bangles...' },
  { id: 'ORD-002', date: '22 Jun 2026', items: 3, amount: 28750, status: 'Dispatched', products: 'Diamond Ring, Chain...' },
  { id: 'ORD-003', date: '25 Jun 2026', items: 8, amount: 72400, status: 'Confirmed', products: 'Silver Set, Jhumka...' },
  { id: 'ORD-004', date: '26 Jun 2026', items: 2, amount: 18200, status: 'Pending', products: 'Gold Earrings...' },
];

const STATUS_COLOR = { Delivered: 'success', Dispatched: 'info', Confirmed: 'gold', Pending: 'warning', Cancelled: 'error' };

export default function B2BOrdersPage() {
  const [activeStatus, setActiveStatus] = useState('All');

  const filtered = MOCK_ORDERS.filter((o) => activeStatus === 'All' || o.status === activeStatus);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Orders</h1>
          <p className={styles.pageSubtitle}>{MOCK_ORDERS.length} total orders</p>
        </div>
        <Link href={ROUTES.BUSINESS.CATALOG} className={styles.newOrderBtn}>
          <ShoppingBag size={16} /> New Order
        </Link>
      </div>

      {/* Status filter */}
      <div className={styles.statusTabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={[styles.tab, activeStatus === s && styles['tab--active']].filter(Boolean).join(' ')}
            onClick={() => setActiveStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className={styles.list}>
        {filtered.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderTop}>
              <div>
                <p className={styles.orderId}>{order.id}</p>
                <p className={styles.orderDate}>{order.date} · {order.items} items</p>
                <p className={styles.orderProducts}>{order.products}</p>
              </div>
              <div className={styles.orderRight}>
                <p className={styles.orderAmount}>₹{order.amount.toLocaleString('en-IN')}</p>
                <span className={[styles.statusBadge, styles[`statusBadge--${STATUS_COLOR[order.status]}`]].join(' ')}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
