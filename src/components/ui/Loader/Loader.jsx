import styles from './Loader.module.scss';

export default function Loader({ size = 'md', centered = false }) {
  return (
    <div className={[styles.container, centered && styles['container--centered']].filter(Boolean).join(' ')}>
      <span className={[styles.spinner, styles[`spinner--${size}`]].join(' ')} />
    </div>
  );
}
