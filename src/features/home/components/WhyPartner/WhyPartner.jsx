import { BadgeCheck, Percent, ShieldCheck, Headset, Package, Truck, Undo2, Store } from 'lucide-react';
import styles from './WhyPartner.module.scss';

const REASONS = [
  { icon: BadgeCheck, label: 'Hallmarked Jewellery' },
  { icon: Percent, label: 'Wholesale Pricing' },
  { icon: ShieldCheck, label: 'Secure Payments' },
  { icon: Headset, label: 'Dedicated Support' },
  { icon: Package, label: 'Large Inventory' },
  { icon: Store, label: 'Verified Sellers' },
];

export default function WhyPartner({ title = 'Why Partner With Us?' }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {REASONS.map((r) => (
          <div key={r.label} className={styles.card}>
            <span className={styles.iconWrap}>
              <r.icon size={20} strokeWidth={1.5} />
            </span>
            <span className={styles.label}>{r.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
