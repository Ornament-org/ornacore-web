'use client';
import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { productApi } from '@/services/productApi';
import styles from './LiveRateCard.module.scss';

const formatMoney = (value) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatDate = (value) => {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
};

// Pulls the same admin-set base+extra total the toolbox's Metal Rates page
// computes and shows shopkeepers — previously this card was hardcoded mock
// data, so an admin's markup ("Extra") never actually reached the storefront.
export default function LiveRateCard({ title = "Today's Metal Rates" }) {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    let alive = true;
    productApi
      .getMetalRates()
      .then((response) => {
        if (!alive) return;
        setRates((response.data ?? []).filter((rate) => rate.displayCurrentPrice !== null));
      })
      .catch(() => {
        if (alive) setRates([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (rates !== null && !rates.length) return null;

  const latestAsOf = (rates ?? [])
    .map((rate) => rate.asOfDate)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {latestAsOf ? (
              <p className={styles.updated}>
                <Clock size={12} /> Last updated: {formatDate(latestAsOf)}
              </p>
            ) : null}
          </div>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} /> Live
          </span>
        </div>

        <div className={styles.rates}>
          {rates === null
            ? Array.from({ length: 2 }).map((_, index) => <div key={index} className={styles.rateItem} />)
            : rates.map((rate) => {
                const isUp = (rate.displayChange ?? 0) >= 0;
                return (
                  <div key={rate.metalId} className={styles.rateItem}>
                    <span className={styles.rateLabel}>{rate.name}</span>
                    <span className={styles.rateValue}>
                      {formatMoney(rate.displayCurrentPrice)}
                      <span className={styles.perGm}>/{rate.displayUnit}</span>
                    </span>
                    <span className={styles.rateMeta}>
                      <span className={styles.purity}>PER {rate.displayUnit?.toUpperCase()}</span>
                      {rate.displayChange !== null ? (
                        <span
                          className={styles.change}
                          style={!isUp ? { color: '#f87171' } : undefined}
                        >
                          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {formatMoney(Math.abs(rate.displayChange))} ({Math.abs(rate.changePercent ?? 0)}%)
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
        </div>

        <button type="button" className={styles.viewChart}>
          View Rate Chart <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}
