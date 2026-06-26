'use client';
import { TrendingDown, TrendingUp, BookOpen } from 'lucide-react';
import styles from './KhatabookPage.module.scss';

const LEDGER = [
  { date: '01 Jun', description: 'Order ORD-001', debit: 45200, credit: 0, balance: 124500 },
  { date: '05 Jun', description: 'Payment Received', debit: 0, credit: 50000, balance: 74500 },
  { date: '10 Jun', description: 'Order ORD-002', debit: 28750, credit: 0, balance: 103250 },
  { date: '15 Jun', description: 'Delivery Charges', debit: 200, credit: 0, balance: 103450 },
  { date: '20 Jun', description: 'Payment Received', debit: 0, credit: 25000, balance: 78450 },
  { date: '25 Jun', description: 'Order ORD-003', debit: 72400, credit: 0, balance: 150850 },
].reverse();

export default function KhatabookPage() {
  const totalDue = 1_50_850;
  const totalPaid = 75_000;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Khatabook</h1>
          <p className={styles.pageSubtitle}>Account statement & credit history</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={[styles.summaryCard, styles['summaryCard--due']].join(' ')}>
          <TrendingDown size={24} className={styles.summaryIcon} />
          <div>
            <p className={styles.summaryLabel}>Outstanding Due</p>
            <p className={styles.summaryValue}>₹{totalDue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className={[styles.summaryCard, styles['summaryCard--paid']].join(' ')}>
          <TrendingUp size={24} className={styles.summaryIcon} />
          <div>
            <p className={styles.summaryLabel}>Total Paid</p>
            <p className={styles.summaryValue}>₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className={[styles.summaryCard, styles['summaryCard--credit']].join(' ')}>
          <BookOpen size={24} className={styles.summaryIcon} />
          <div>
            <p className={styles.summaryLabel}>Credit Limit</p>
            <p className={styles.summaryValue}>₹2,00,000</p>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      <div className={styles.ledgerSection}>
        <h2 className={styles.sectionTitle}>Transaction History</h2>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Date</span>
            <span>Description</span>
            <span>Debit</span>
            <span>Credit</span>
            <span>Balance</span>
          </div>
          {LEDGER.map((row, i) => (
            <div key={i} className={styles.tableRow}>
              <span>{row.date}</span>
              <span className={styles.desc}>{row.description}</span>
              <span className={styles.debit}>{row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '—'}</span>
              <span className={styles.credit}>{row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '—'}</span>
              <span className={styles.balance}>₹{row.balance.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
