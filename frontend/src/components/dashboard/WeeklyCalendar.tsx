import { format, addDays, isToday as checkIsToday } from 'date-fns';
import styles from './WeeklyCalendar.module.css';
import Link from 'next/link';

interface MealPlanItem {
  id: number;
  date: string;
  mealType: string;
  recipe: { id: number; title: string; imageUrl?: string | null };
}

interface Props {
  mealPlans: MealPlanItem[];
  weekStart: Date;
}

export default function WeeklyCalendar({ mealPlans, weekStart }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          This week · {format(weekStart, 'd')}–{format(addDays(weekStart, 6), 'd MMM')}
        </h2>
        <Link href="/planner" className={styles.link}>Full planner →</Link>
      </div>
      <div className={styles.grid}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayMeals = mealPlans.filter((m) => m.date === dateStr);
          const today = checkIsToday(day);
          const dinner = dayMeals.find((m) => m.mealType === 'Dinner');
          const mainTitle = dinner?.recipe?.title || dayMeals[0]?.recipe?.title;

          return (
            <div
              key={dateStr}
              className={`${styles.dayCard} ${today ? styles.today : ''} ${dayMeals.length === 0 ? styles.empty : ''}`}
            >
              <p className={styles.dayLabel}>
                {format(day, 'EEE d')}{today ? ' · Today' : ''}
              </p>
              <p className={styles.dayTitle}>{mainTitle || 'No meals'}</p>
              <p className={styles.dayCount}>{dayMeals.length}/4 meals</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}