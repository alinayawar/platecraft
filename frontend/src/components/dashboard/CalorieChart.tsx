import { format, addDays, isToday as checkIsToday } from 'date-fns';
import styles from './CalorieChart.module.css';

interface DailyNutrition {
  date: string;
  calories: number;
}

interface Props {
  nutrition: DailyNutrition[];
  weekStart: Date;
}

const GOAL = 2450;

export default function CalorieChart({ nutrition, weekStart }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = nutrition.find((n) => n.date === dateStr);
    const cal = entry?.calories || 0;
    const pct = Math.min(Math.round((cal / GOAL) * 100), 100);
    return { label: format(d, 'EEE'), pct, isToday: checkIsToday(d), cal };
  });

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.title}>Calories vs. goal</h3>
          <p className={styles.sub}>Daily intake · goal {GOAL.toLocaleString('en-US')} kcal</p>
        </div>
      </div>
      <div className={styles.chartWrap}>
        <div className={styles.goalLine}><span className={styles.goalLabel}>Goal</span></div>
        <div className={styles.bars}>
          {days.map((d, i) => (
            <div key={i} className={styles.barCol}>
              <div
                className={`${styles.bar} ${d.isToday ? styles.barToday : d.pct > 0 ? styles.barFilled : styles.barPlanned}`}
                style={{ height: `${Math.max(d.pct, 2)}%` }}
              />
              <span className={`${styles.barLabel} ${d.isToday ? styles.barLabelBold : ''}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotFilled}`} />Logged</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotPlanned}`} />Planned</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotToday}`} />Today</span>
      </div>
    </div>
  );
}