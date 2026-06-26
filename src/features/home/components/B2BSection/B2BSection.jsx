'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Briefcase } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import styles from './B2BSection.module.scss';

const BENEFITS = [
  'Credit Facility & Khatabook',
  'Wide Range of Products',
  'Exclusive B2B Pricing',
  'Dedicated Support',
];

export default function B2BSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Left: Jewellery business pitch */}
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className={styles.tag}>For Jewellery Partners</span>
            <h2 className={styles.title}>Are you a Jewellery Business?</h2>
            <p className={styles.subtitle}>
              Join OrnaCo Business platform and grow your business with exclusive benefits.
            </p>
            <ul className={styles.benefits}>
              {BENEFITS.map((benefit) => (
                <li key={benefit} className={styles.benefit}>
                  <Check size={16} className={styles.checkIcon} />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link href={ROUTES.BUSINESS.REGISTER} className={styles.registerBtn}>
              Become a Partner
            </Link>
          </motion.div>

          {/* Center: Illustration */}
          <motion.div
            className={styles.center}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className={styles.illustration}>
              <span className={styles.illustrationIcon}>🤝</span>
            </div>
          </motion.div>

          {/* Right: Business login */}
          <motion.div
            className={styles.right}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span className={styles.tag}>Already a Partner?</span>
            <h3 className={styles.loginTitle}>Login to Business Account</h3>
            <p className={styles.loginSub}>Access your business dashboard</p>
            <Link href={ROUTES.BUSINESS.LOGIN} className={styles.loginBtn}>
              <Briefcase size={18} />
              Business Login
            </Link>
            <p className={styles.registerHint}>
              New Business Partner?{' '}
              <Link href={ROUTES.BUSINESS.REGISTER} className={styles.registerLink}>
                Register Now
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
