'use client';
import { motion } from 'framer-motion';
import { Users, Award, ThumbsUp, Shield, Truck } from 'lucide-react';
import styles from './TrustBadges.module.scss';

const BADGES = [
  { icon: Users, value: '20+', label: 'Years of Trust' },
  { icon: Award, value: 'BIS', label: '100% Hallmarked' },
  { icon: ThumbsUp, value: '4.8 Lakh+', label: 'Happy Customers' },
  { icon: Shield, value: 'Secure Payment', label: '100% Protected' },
  { icon: Truck, value: 'Pan India', label: 'Delivery' },
];

export default function TrustBadges() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.value}
              className={styles.badge}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <badge.icon size={32} strokeWidth={1.5} className={styles.icon} />
              <div>
                <p className={styles.value}>{badge.value}</p>
                <p className={styles.label}>{badge.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
