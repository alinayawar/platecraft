import { format, addDays } from 'date-fns';
import styles from './planner.module.css';

interface Props {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekNavigator({ weekStart, onPrev, onNext, onToday }: Props) {
  const end = addDays(weekStart, 6);
  const label = `${format(weekStart, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;

  return (
    <div className={styles.nav}>
      <button className={styles.navBtn} onClick={onPrev} aria-label="Previous week">←</button>
      <button className={styles.navBtn} onClick={onNext} aria-label="Next week">→</button>
      <span className={styles.navLabel}>{label}</span>
      <button className={styles.todayBtn} onClick={onToday}>Today</button>
    </div>
  );
}