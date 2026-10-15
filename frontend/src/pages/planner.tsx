import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import apiClient from '@/api/client';
import type { MealPlan, Recipe } from '@/types';
import WeekNavigator from '@/components/planner/WeekNavigator';
import DayColumn from '@/components/planner/DayColumn';
import MealAssignModal from '@/components/planner/MealAssignModal';
import styles from '@/components/planner/planner.module.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

interface MealPlanWithRecipe extends MealPlan {
  recipe?: { id: number; title: string; imageUrl?: string | null };
}

export default function WeeklyPlanner() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlanWithRecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalMealType, setModalMealType] = useState<string>('Dinner');

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mpRes, recRes] = await Promise.all([
        apiClient.get('/api/meal-plans', { params: { weekStart: weekStartStr } }),
        apiClient.get('/api/recipes'),
      ]);
      setMealPlans(mpRes.data ?? []);
      setRecipes(recRes.data ?? []);
    } catch {
      setError('Failed to load meal plans.');
    } finally {
      setLoading(false);
    }
  }, [weekStartStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const openModal = (date: Date, mealType: string) => {
    setModalDate(format(date, 'yyyy-MM-dd'));
    setModalMealType(mealType);
    setModalOpen(true);
  };

  const handleAssign = async (recipeId: number, servings: number) => {
    try {
      await apiClient.post('/api/meal-plans', {
        date: modalDate,
        mealType: modalMealType,
        recipeId,
        servings,
      });
      setModalOpen(false);
      fetchData();
    } catch {
      alert('Failed to add meal.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/meal-plans/${id}`);
      fetchData();
    } catch {
      alert('Failed to remove meal.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Weekly Planner</h1>
          <p className={styles.subtitle}>Drag your week into shape — one meal at a time</p>
        </div>
      </div>

      <WeekNavigator
        weekStart={weekStart}
        onPrev={() => setWeekStart(subWeeks(weekStart, 1))}
        onNext={() => setWeekStart(addWeeks(weekStart, 1))}
        onToday={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
      />

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <div className={styles.grid}>
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayPlans = mealPlans.filter((mp) => mp.date === dateStr);
            return (
              <DayColumn
                key={dateStr}
                date={day}
                mealTypes={MEAL_TYPES as unknown as string[]}
                plans={dayPlans}
                onAddMeal={(mealType) => openModal(day, mealType)}
                onDeleteMeal={handleDelete}
              />
            );
          })}
        </div>
      )}

      {modalOpen && (
        <MealAssignModal
          recipes={recipes}
          mealType={modalMealType}
          date={modalDate}
          onAssign={handleAssign}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}