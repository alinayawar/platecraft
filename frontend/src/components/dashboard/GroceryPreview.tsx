import Link from 'next/link';
import styles from './GroceryPreview.module.css';
import { GroceryItem } from '@/types';

interface Props {
  items: GroceryItem[];
  totalCount: number;
}

export default function GroceryPreview({ items, totalCount }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>Still to buy</h3>
        <span className={styles.badge}>{items.length} left</span>
      </div>
      <p className={styles.sub}>Items from this week&apos;s meal plan</p>
      {items.length === 0 ? (
        <p className={styles.empty}>No items to buy — you&apos;re all set!</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.meta}>
                {item.quantity ? `${item.quantity} ${item.unit || ''}` : ''}{item.aisle ? ` · ${item.aisle}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/grocery-list" className={styles.link}>
        View all {totalCount} items →
      </Link>
    </div>
  );
}