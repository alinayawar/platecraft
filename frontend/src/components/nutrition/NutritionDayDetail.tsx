import { format, parseISO } from 'date-fns';
import styles from '@/components/nutrition/NutritionDayDetail.module.css';

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

interface Props {
  day: DailyNutrition;
  onClose: () => void;
}

export default function NutritionDayDetail({ day, onClose }: Props) {
  const macros = [
    { label: 'Protein', value: day.protein, unit: 'g', color: '#4A5B37' },
    { label: 'Carbs', value: day.carbs, unit: 'g', color: '#D9B26B' },
    { label: 'Fat', value: day.fat, unit: 'g', color: '#C8673F' },
    { label: 'Fiber', value: day.fiber, unit: 'g', color: '#5E7148' },
    { label: 'Sugar', value: day.sugar, unit: 'g', color: '#B05530' },
  ];

  const total = day.protein + day.carbs + day.fat || 1;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{format(parseISO(day.date), 'EEEE, MMM d')}</h3>
          <p className={styles.cal}>{Math.round(day.calories)} kcal</p>
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className={styles.barRow}>
        {macros.slice(0, 3).map((m) => (
          <div
            key={m.label}
            className={styles.barSegment}
            style={{ flex: m.value / total, backgroundColor: m.color }}
            title={`${m.label}: ${Math.round(m.value)}${m.unit}`}
          />
        ))}
      </div>

      <div className={styles.macroGrid}>
        {macros.map((m) => (
          <div key={m.label} className={styles.macroItem}>
            <span className={styles.macroDot} style={{ backgroundColor: m.color }} />
            <span className={styles.macroLabel}>{m.label}</span>
            <span className={styles.macroValue}>
              {Math.round(m.value)}
              {m.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}