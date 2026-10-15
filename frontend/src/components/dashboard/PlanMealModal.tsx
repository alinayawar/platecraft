import { useState } from 'react';
import { Recipe } from '@/types';
import apiClient from '@/api/client';
import styles from './PlanMealModal.module.css';
import { format } from 'date-fns';

interface Props {
  recipes: Recipe[];
  onClose: () => void;
  onCreated: () => void;
}

export default function PlanMealModal({ recipes, onClose, onCreated }: Props) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || 0);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState('Dinner');
  const [servings, setServings] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeId) return;
    setSubmitting(true);
    try {
      await apiClient.post('/api/meal-plans', { recipeId, date, mealType, servings });
      onCreated();
    } catch {
      alert('Failed to plan meal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Plan a meal</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <label className={styles.field}>
          Recipe
          <select value={recipeId} onChange={(e) => setRecipeId(Number(e.target.value))} className={styles.input}>
            {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </label>
        <div className={styles.row}>
          <label className={styles.field}>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
          </label>
          <label className={styles.field}>
            Meal
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={styles.input}>
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label className={styles.field}>
          Servings
          <input type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} className={styles.input} />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add to plan'}
          </button>
        </div>
      </form>
    </div>
  );
}