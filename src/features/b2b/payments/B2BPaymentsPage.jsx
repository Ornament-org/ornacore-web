'use client';
import { Wallet, CheckCircle, Clock } from 'lucide-react';
import styles from './B2BPaymentsPage.module.scss';

const PAYMENTS = [
  { id: 'PAY-001', date: '20 Jun 2026', amount: 25000, method: 'Bank Transfer', status: 'Completed', ref: 'UTR123456' },
  { id: 'PAY-002', date: '05 Jun 2026', amount: 50000, method: 'UPI', status: 'Completed', ref: 'UPI789012' },
  { id: 'PAY-003', date: '26 Jun 2026', amount: 45200, method: 'Credit', status: 'Pending', ref: '—' },
];

export default function B2BPaymentsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSubtitle}>Payment history and outstanding dues</p>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className={[styles.card, styles['card--pending']].join(' ')}>
          <Clock size={24} />
          <div>
            <p>Pending Dues</p>
            <p className={styles.amount}>₹1,50,850</p>
          </div>
        </div>
        <div className={[styles.card, styles['card--done']].join(' ')}>
          <CheckCircle size={24} />
          <div>
            <p>Total Paid (MTD)</p>
            <p className={styles.amount}>₹75,000</p>
          </div>
        </div>
        <div className={[styles.card, styles['card--limit']].join(' ')}>
          <Wallet size={24} />
          <div>
            <p>Credit Limit Remaining</p>
            <p className={styles.amount}>₹49,150</p>
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Transaction History</h2>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>ID</span><span>Date</span><span>Amount</span><span>Method</span><span>Reference</span><span>Status</span>
          </div>
          {PAYMENTS.map((p) => (
            <div key={p.id} className={styles.tableRow}>
              <span className={styles.payId}>{p.id}</span>
              <span>{p.date}</span>
              <span className={styles.payAmt}>₹{p.amount.toLocaleString('en-IN')}</span>
              <span>{p.method}</span>
              <span className={styles.ref}>{p.ref}</span>
              <span>
                <span className={[styles.badge, p.status === 'Completed' ? styles['badge--success'] : styles['badge--warning']].join(' ')}>
                  {p.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
