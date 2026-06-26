import styles from './Badge.module.scss';

export default function Badge({ children, variant = 'default', size = 'sm' }) {
  return (
    <span className={[styles.badge, styles[`badge--${variant}`], styles[`badge--${size}`]].join(' ')}>
      {children}
    </span>
  );
}
