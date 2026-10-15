import styles from './planner.module.css';
import type { MealPlan } from '@/types';

interface PlanWithRecipe extends MealPlan {
  recipe?: { id: number; title: string; imageUrl?: string | null };
}

interface Props {
  mealType: string;
  plan?: PlanWithRecipe;
  onAdd: () => void;
  onDelete?: () => void;
}

export default function MealSlot({ mealType, plan, onAdd, onDelete }: Props) {
  if (!plan) {
    return (
      <button className={`${styles.slot} ${styles.slotEmpty}`} onClick={onAdd}>
        <span className={styles.slotType}>{mealType}</span>
        <span className={styles.slotAdd}>+ Add</span>
      </button>
    );
  }

  const title = plan.recipe?.title ?? `Recipe #${plan.recipeId}`;

  return (
    <div className={`${styles.slot} ${styles.slotFilled}`}>
      <span className={styles.slotType}>{mealType}</span>
      <span className={styles.slotTitle}>{title}</span>
      <div className={styles.slotMeta}>
        <span className={styles.slotServings}>{plan.servings} serving{plan.servings !== 1 ? 's' : ''}</span>
        {onDelete && (
          <button className={styles.slotDelete} onClick={onDelete} aria-label="Remove meal">✕</button>
        )}
      </div>
    </div>
  );
}