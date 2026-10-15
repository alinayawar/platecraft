import { format, isToday } from 'date-fns';
import MealSlot from './MealSlot';
import styles from './planner.module.css';
import type { MealPlan } from '@/types';

interface PlanWithRecipe extends MealPlan {
  recipe?: { id: number; title: string; imageUrl?: string | null };
}

interface Props {
  date: Date;
  mealTypes: string[];
  plans: PlanWithRecipe[];
  onAddMeal: (mealType: string) => void;
  onDeleteMeal: (id: number) => void;
}

export default function DayColumn({ date, mealTypes, plans, onAddMeal, onDeleteMeal }: Props) {
  const today = isToday(date);

  return (
    <div className={`${styles.dayCol} ${today ? styles.dayColToday : ''}`}>
      <p className={`${styles.dayHeader} ${today ? styles.dayHeaderToday : ''}`}>
        {format(date, 'EEE')}{today ? ' · Today' : ''}
      </p>
      <p className={styles.dayDate}>{format(date, 'd')}</p>
      <div className={styles.slots}>
        {mealTypes.map((mt) => {
          const plan = plans.find((p) => p.mealType === mt);
          return (
            <MealSlot
              key={mt}
              mealType={mt}
              plan={plan}
              onAdd={() => onAddMeal(mt)}
              onDelete={plan ? () => onDeleteMeal(plan.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}