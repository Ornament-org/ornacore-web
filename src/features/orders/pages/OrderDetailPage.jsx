'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gem, PackageSearch, Truck } from 'lucide-react';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { ROUTES } from '@/constants/routes';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
import AccountHeader from '@/features/account/components/AccountHeader/AccountHeader';
import styles from './OrderDetailPage.module.scss';

const formatWeight = (grams) => `${Number(grams ?? 0).toFixed(3).replace(/\.?0+$/, '')} g`;

const primaryImage = (product) =>
  product?.images?.find((image) => image.isPrimary)?.media?.secureUrl
  ?? product?.images?.[0]?.media?.secureUrl
  ?? null;

const formatDate = (value, withTime = false) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : '—';

const weightByMetal = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const metalName = item.product?.metal?.name ?? 'Other';
    const weight = Number(item.variant?.weightGrams ?? 0) * Number(item.quantity ?? 0);
    groups.set(metalName, (groups.get(metalName) ?? 0) + weight);
  });
  return Array.from(groups.entries());
};

export default function OrderDetailPage({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await shopkeeperApi.getOrderById(id);
        if (!alive) return;
        setOrder(response.data);
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
  }, [id]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBlock}>
          <PackageSearch size={34} />
          <p>Loading order…</p>
        </div>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBlock}>
          <PackageSearch size={34} />
          <h2>Order not found</h2>
          <p>This order may not belong to your account, or the link is incorrect.</p>
          <Link href={ROUTES.ORDERS} className={styles.backLink}>← Back to Orders</Link>
        </div>
      </main>
    );
  }

  const items = order.items ?? [];
  const weights = weightByMetal(items);
  const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.REQUESTED;
  const delivery = order.delivery;

  return (
    <main className={styles.page}>
      <AccountHeader
        title={order.orderNumber}
        description={`Placed on ${formatDate(order.createdAt, true)}`}
        backHref={ROUTES.ORDERS}
        backLabel="My Orders"
      />

      <div className={styles.statusRow}>
        <span className={[styles.statusPill, styles[`statusPill--${meta.tone}`]].join(' ')}>
          {meta.label}
        </span>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Items</h2>
          <div className={styles.itemsTable}>
            {items.map((item) => {
              const imageUrl = primaryImage(item.product);
              return (
                <div className={styles.itemRow} key={item.id}>
                  <span className={styles.itemThumb}>
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- product image host is admin-configurable from toolbox media
                      <img src={imageUrl} alt="" />
                    ) : (
                      <Gem size={18} strokeWidth={1.5} />
                    )}
                  </span>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.productNameSnapshot}</p>
                    <p className={styles.itemMeta}>
                      SKU {item.skuSnapshot} · {item.product?.metal?.name ?? 'Metal'} ·{' '}
                      {formatWeight(item.variant?.weightGrams)} each
                    </p>
                  </div>
                  <div className={styles.itemQty}>
                    <span>Qty {Number(item.quantity)}</span>
                    <strong>{formatWeight(Number(item.variant?.weightGrams ?? 0) * Number(item.quantity ?? 0))}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {order.notes ? (
            <div className={styles.notes}>
              <h3>Delivery Notes</h3>
              <p>{order.notes}</p>
            </div>
          ) : null}
        </section>

        <aside className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRows}>
            {weights.map(([metalName, weight]) => (
              <div className={styles.summaryRow} key={metalName}>
                <span>{metalName} Weight</span>
                <span>{formatWeight(weight)}</span>
              </div>
            ))}
          </div>
          <p className={styles.weightNotice}>
            Weight shown is approximate — the final weight and amount will be confirmed on your
            invoice based on the exact piece weight and live rate at billing.
          </p>

          {delivery ? (
            <div className={styles.deliveryBlock}>
              <h3><Truck size={15} /> Delivery</h3>
              <div className={styles.summaryRow}>
                <span>Status</span>
                <span>{delivery.status?.replaceAll('_', ' ')}</span>
              </div>
              {delivery.courierName ? (
                <div className={styles.summaryRow}>
                  <span>Courier</span>
                  <span>{delivery.courierName}</span>
                </div>
              ) : null}
              {delivery.trackingNumber ? (
                <div className={styles.summaryRow}>
                  <span>Tracking No.</span>
                  <span>{delivery.trackingNumber}</span>
                </div>
              ) : null}
              {delivery.dispatchedAt ? (
                <div className={styles.summaryRow}>
                  <span>Dispatched</span>
                  <span>{formatDate(delivery.dispatchedAt)}</span>
                </div>
              ) : null}
              {delivery.deliveredAt ? (
                <div className={styles.summaryRow}>
                  <span>Delivered</span>
                  <span>{formatDate(delivery.deliveredAt)}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {(order.statusHistory ?? []).length ? (
            <div className={styles.timeline}>
              <h3>Status History</h3>
              {order.statusHistory
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((entry) => (
                  <div className={styles.timelineRow} key={entry.id}>
                    <span className={styles.timelineDot} />
                    <div>
                      <p className={styles.timelineLabel}>
                        {(ORDER_STATUS_META[entry.toStatus] ?? { label: entry.toStatus }).label}
                      </p>
                      <p className={styles.timelineDate}>{formatDate(entry.createdAt, true)}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
