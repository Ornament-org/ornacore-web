'use client';
import { motion } from 'framer-motion';
import { ShoppingBag, Wallet, BookOpen, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import styles from './DashboardPage.module.scss';

const STATS = [
  { label: 'Total Orders', value: '48', change: '+3 this month', icon: ShoppingBag, color: 'gold' },
  { label: 'Outstanding Dues', value: '₹1,24,500', change: '3 invoices pending', icon: AlertCircle, color: 'warning' },
  { label: 'Payments Done', value: '₹3,82,000', change: 'Last 30 days', icon: Wallet, color: 'success' },
  { label: 'Metal Due (Gold)', value: '142.5g', change: '22K purity', icon: TrendingUp, color: 'info' },
];

const RECENT_ORDERS = [
  { id: 'ORD-001', date: '15 Jun 2026', items: 5, amount: '₹45,200', status: 'Delivered' },
  { id: 'ORD-002', date: '22 Jun 2026', items: 3, amount: '₹28,750', status: 'Dispatched' },
  { id: 'ORD-003', date: '25 Jun 2026', items: 8, amount: '₹72,400', status: 'Confirmed' },
  { id: 'ORD-004', date: '26 Jun 2026', items: 2, amount: '₹18,200', status: 'Pending' },
];

const STATUS_COLORS = {
  Delivered: 'success',
  Dispatched: 'info',
  Confirmed: 'gold',
  Pending: 'warning',
};

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back, Rajesh Jewellers</p>
        </div>
        <Link href={ROUTES.BUSINESS.CATALOG} className={styles.newOrderBtn}>
          <ShoppingBag size={16} /> Browse Catalog
        </Link>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={[styles.statCard, styles[`statCard--${stat.color}`]].join(' ')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={styles.statHeader}>
              <p className={styles.statLabel}>{stat.label}</p>
              <div className={[styles.statIconWrap, styles[`statIconWrap--${stat.color}`]].join(' ')}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statChange}>{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href={ROUTES.BUSINESS.ORDERS} className={styles.sectionLink}>
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Order ID</span>
            <span>Date</span>
            <span>Items</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {RECENT_ORDERS.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span className={styles.orderId}>{order.id}</span>
              <span>{order.date}</span>
              <span>{order.items} items</span>
              <span className={styles.amount}>{order.amount}</span>
              <span>
                <span className={[styles.statusBadge, styles[`statusBadge--${STATUS_COLORS[order.status]}`]].join(' ')}>
                  {order.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        {[
          { label: 'New Order', href: ROUTES.BUSINESS.CATALOG, icon: ShoppingBag },
          { label: 'Khatabook', href: ROUTES.BUSINESS.KHATABOOK, icon: BookOpen },
          { label: 'Payments', href: ROUTES.BUSINESS.PAYMENTS, icon: Wallet },
        ].map((action) => (
          <Link key={action.label} href={action.href} className={styles.quickAction}>
            <action.icon size={20} />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
