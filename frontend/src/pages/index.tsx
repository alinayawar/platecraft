import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Recipe, MealPlan, GroceryItem } from '@/types';
import WeeklyCalendar from '@/components/dashboard/WeeklyCalendar';
import TodayMeals from '@/components/dashboard/TodayMeals';
import NutritionSummary from '@/components/dashboard/NutritionSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import CalorieChart from '@/components/dashboard/CalorieChart';
import GroceryPreview from '@/components/dashboard/GroceryPreview';
import StatCards from '@/components/dashboard/StatCards';
import PlanMealModal from '@/components/dashboard/PlanMealModal';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import styles from '@/components/dashboard/Dashboard.module.css';

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

interface MealPlanWithRecipe {
  id: number;
  recipeId: number;
  date: string;
  mealType: string;
  servings: number;
  recipe: { id: number; title: string; imageUrl?: string | null };
}

export default function Dashboard() {
  const [mealPlans, setMealPlans] = useState<MealPlanWithRecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mpRes, recRes, grRes, nuRes] = await Promise.all([
        apiClient.get('/api/meal-plans', { params: { weekStart: weekStartStr } }),
        apiClient.get('/api/recipes'),
        apiClient.get('/api/grocery-list', { params: { weekStart: weekStartStr } }),
        apiClient.get('/api/nutrition/daily', {
          params: { startDate: weekStartStr, endDate: format(weekEnd, 'yyyy-MM-dd') },
        }),
      ]);
      setMealPlans(mpRes.data || []);
      setRecipes(recRes.data || []);
      setGroceryItems(grRes.data || []);
      setNutrition(nuRes.data || []);
    } catch (e: any) {
      setError('Failed to load dashboard data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [weekStartStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayStr = format(now, 'yyyy-MM-dd');
  const todayMeals = mealPlans.filter((m) => m.date === todayStr);
  const todayNutrition = nutrition.find((n) => n.date === todayStr);
  const uncheckedGrocery = groceryItems.filter((g) => !g.checked);
  const totalSlots = 7 * 4;
  const plannedCount = mealPlans.length;

  const dayOfWeek = format(now, 'EEEE');
  const dateLabel = format(now, 'EEEE, d MMMM') + ' · Week ' + format(now, 'w');

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading your kitchen…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — Platecraft</title>
      </Head>

      <header className={styles.header}>
        <div>
          <p className={styles.dateLine}>{dateLabel}</p>
          <h1 className={styles.greeting}>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.planBtn} onClick={() => setModalOpen(true)}>
            <span className={styles.plusIcon}>+</span> Plan a meal
          </button>
        </div>
      </header>

      {/* Hero row */}
      <section className={styles.heroRow}>
        <TodayMeals meals={todayMeals} />
        <NutritionSummary data={todayNutrition || null} />
      </section>

      {/* Stat cards */}
      <StatCards
        mealsPlanned={plannedCount}
        totalSlots={totalSlots}
        groceryTotal={groceryItems.length}
        groceryLeft={uncheckedGrocery.length}
        nutrition={nutrition}
      />

      {/* Week strip */}
      <WeeklyCalendar mealPlans={mealPlans} weekStart={weekStart} />

      {/* Lower row */}
      <section className={styles.lowerRow}>
        <CalorieChart nutrition={nutrition} weekStart={weekStart} />
        <GroceryPreview items={uncheckedGrocery.slice(0, 5)} totalCount={groceryItems.length} />
      </section>

      {modalOpen && (
        <PlanMealModal
          recipes={recipes}
          onClose={() => setModalOpen(false)}
          onCreated={() => { setModalOpen(false); fetchData(); }}
        />
      )}
    </>
  );
}