'use client';
import B2BSidebar from '../B2BSidebar/B2BSidebar';
import styles from './B2BLayout.module.scss';

export default function B2BLayout({ children }) {
  return (
    <div className={styles.layout}>
      <B2BSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
