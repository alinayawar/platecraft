import Link from 'next/link';
import styles from './QuickActions.module.css';

export default function QuickActions() {
  return (
    <div className={styles.wrap}>
      <Link href="/recipes" className={styles.btn}>Browse recipes</Link>
      <Link href="/planner" className={styles.btn}>Open planner</Link>
      <Link href="/grocery-list" className={styles.btn}>Shopping list</Link>
      <Link href="/nutrition" className={styles.btn}>Nutrition</Link>
    </div>
  );
}