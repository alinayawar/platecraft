import { useState, useEffect } from 'react';
import Head from 'next/head';
import apiClient from '@/api/client';
import { format, subDays, startOfWeek, endOfWeek, addDays } from 'date-fns';
import NutritionCharts from '@/components/nutrition/NutritionCharts';
import NutritionDayDetail from '@/components/nutrition/NutritionDayDetail';
import styles from '@/components/nutrition/Nutrition.module.css';

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

type Range = '7' | '14' | '30';

export default function Nutrition() {
  const [data, setData] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<Range>('7');
  const [selectedDay, setSelectedDay] = useState<DailyNutrition | null>(null);

  useEffect(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(range));
    setLoading(true);
    setError('');
    apiClient
      .get('/api/nutrition/daily', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
      })
      .then((res) => {
        setData(res.data);
        setSelectedDay(null);
      })
      .catch(() => setError('Failed to load nutrition data.'))
      .finally(() => setLoading(false));
  }, [range]);

  const avg = (key: keyof Omit<DailyNutrition, 'date'>) => {
    if (!data.length) return 0;
    return Math.round(data.reduce((s, d) => s + (d[key] ?? 0), 0) / data.length);
  };

  return (
    <>
      <Head>
        <title>Nutrition — Platecraft</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>Track your intake</p>
            <h1 className={styles.title}>Nutrition</h1>
          </div>
          <div className={styles.rangeTabs} role="tablist">
            {(['7', '14', '30'] as Range[]).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                className={`${styles.rangeTab} ${range === r ? styles.rangeTabActive : ''}`}
                onClick={() => setRange(r)}
              >
                {r}d
              </button>
            ))}
          </div>
        </header>

        {loading && <p className={styles.msg}>Loading…</p>}
        {error && <p className={styles.msgError}>{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p className={styles.msg}>No nutrition data for this period. Plan some meals first!</p>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* Averages */}
            <section className={styles.avgGrid}>
              {[
                { label: 'Avg Calories', value: avg('calories'), unit: 'kcal', accent: 'olive' },
                { label: 'Avg Protein', value: avg('protein'), unit: 'g', accent: 'olive' },
                { label: 'Avg Carbs', value: avg('carbs'), unit: 'g', accent: 'gold' },
                { label: 'Avg Fat', value: avg('fat'), unit: 'g', accent: 'clay' },
                { label: 'Avg Fiber', value: avg('fiber'), unit: 'g', accent: 'olive' },
                { label: 'Avg Sugar', value: avg('sugar'), unit: 'g', accent: 'clay' },
              ].map((m) => (
                <div key={m.label} className={styles.avgCard}>
                  <p className={styles.avgLabel}>{m.label}</p>
                  <p className={styles.avgValue}>
                    {m.value}
                    <span className={styles.avgUnit}>{m.unit}</span>
                  </p>
                </div>
              ))}
            </section>

            {/* Charts */}
            <NutritionCharts data={data} onSelectDay={setSelectedDay} />

            {/* Day detail */}
            {selectedDay && <NutritionDayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />}
          </>
        )}
      </div>
    </>
  );
}