import { useState, useEffect } from 'react';
import type { Recipe } from '@/types';
import styles from './planner.module.css';

interface Props {
  recipes: Recipe[];
  mealType: string;
  date: string;
  onAssign: (recipeId: number, servings: number) => void;
  onClose: () => void;
}

export default function MealAssignModal({ recipes, mealType, date, onAssign, onClose }: Props) {
  const [recipeId, setRecipeId] = useState<number>(recipes[0]?.id ?? 0);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Plan a meal</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: '#7A7166', marginTop: 4 }}>
          {mealType} · {date}
        </p>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Recipe</span>
          <select
            className={styles.input}
            value={recipeId}
            onChange={(e) => setRecipeId(Number(e.target.value))}
          >
            {recipes.length === 0 && <option value={0}>No recipes available</option>}
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Servings</span>
          <input
            type="number"
            className={styles.input}
            min={1}
            value={servings}
            onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
          />
        </label>

        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            disabled={!recipeId}
            onClick={() => onAssign(recipeId, servings)}
          >
            Add to plan
          </button>
        </div>
      </div>
    </div>
  );
}