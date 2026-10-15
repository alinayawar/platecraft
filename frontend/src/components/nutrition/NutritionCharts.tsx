import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import styles from '@/components/nutrition/NutritionCharts.module.css';

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
  data: DailyNutrition[];
  onSelectDay: (d: DailyNutrition) => void;
}

export default function NutritionCharts({ data, onSelectDay }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  return (
    <div className={styles.wrap}>
      {/* Calorie bar chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Daily Calories</h3>
        <p className={styles.cardSub}>Click a bar to see breakdown</p>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} onClick={(e) => e?.activePayload && onSelectDay(e.activePayload[0].payload)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E1D5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7A7166' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A7166' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E1D5', fontSize: 13 }} />
              <Bar dataKey="calories" name="Calories" fill="#4A5B37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macros area chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Macronutrients</h3>
        <p className={styles.cardSub}>Protein, carbs &amp; fat over time</p>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E1D5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7A7166' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A7166' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E1D5', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="protein" name="Protein" stroke="#4A5B37" fill="#4A5B37" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="carbs" name="Carbs" stroke="#D9B26B" fill="#D9B26B" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="fat" name="Fat" stroke="#C8673F" fill="#C8673F" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}