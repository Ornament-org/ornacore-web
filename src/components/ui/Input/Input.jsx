'use client';
import styles from './Input.module.scss';

export default function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  return (
    <div className={[styles.wrapper, error && styles['wrapper--error'], className].filter(Boolean).join(' ')}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.iconLeft}>{icon}</span>}
        <input
          className={[styles.input, icon && styles['input--iconLeft'], iconRight && styles['input--iconRight']].filter(Boolean).join(' ')}
          {...props}
        />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
