import styles from './EmptyState.module.scss';
import Button from '../Button/Button';

export default function EmptyState({ icon, title, description, action, actionLabel = 'Get Started' }) {
  return (
    <div className={styles.wrapper}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button onClick={action} className={styles.action}>{actionLabel}</Button>
      )}
    </div>
  );
}
