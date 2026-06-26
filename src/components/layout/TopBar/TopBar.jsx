'use client';
import { MapPin, Sparkles, Smartphone } from 'lucide-react';
import styles from './TopBar.module.scss';

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <span className={styles.item}>
            <MapPin size={12} />
            Delivering to 400001
          </span>
        </div>
        <div className={styles.center}>
          <span className={styles.item}><Sparkles size={10} /> Certified Jewellery</span>
          <span className={styles.divider}>·</span>
          <span className={styles.item}><Sparkles size={10} /> 100% Hallmarked</span>
          <span className={styles.divider}>·</span>
          <span className={styles.item}><Sparkles size={10} /> Easy Returns</span>
        </div>
        <div className={styles.right}>
          <span className={styles.item}>
            <Smartphone size={12} />
            Download App
          </span>
        </div>
      </div>
    </div>
  );
}
