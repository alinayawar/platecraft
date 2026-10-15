import styles from './NutritionSummary.module.css';

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

const GOAL = { calories: 2450, protein: 130, carbs: 280, fat: 82 };

export default function NutritionSummary({ data }: { data: DailyNutrition | null }) {
  const cal = data?.calories || 0;
  const prot = data?.protein || 0;
  const carbs = data?.carbs || 0;
  const fat = data?.fat || 0;
  const fiber = data?.fiber || 0;
  const sugar = data?.sugar || 0;

  const calPct = Math.min(Math.round((cal / GOAL.calories) * 100), 100);
  const ringStyle = { background: `conic-gradient(#C8673F 0 ${calPct}%, rgba(247,243,236,0.12) ${calPct}% 100%)` };

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>Today&apos;s nutrition</h3>
        <span className={styles.badge}>{calPct >= 60 ? 'On track' : 'Low intake'}</span>
      </div>
      <div className={styles.ringRow}>
        <div className={styles.ring} style={ringStyle}>
          <div className={styles.ringInner}>
            <p className={styles.ringValue}>{Math.round(cal).toLocaleString('en-US')}</p>
            <p className={styles.ringLabel}>of {GOAL.calories.toLocaleString('en-US')} kcal</p>
          </div>
        </div>
        <div className={styles.macros}>
          <MacroBar label="Protein" current={prot} goal={GOAL.protein} color="#F7F3EC" />
          <MacroBar label="Carbs" current={carbs} goal={GOAL.carbs} color="#D9B26B" />
          <MacroBar label="Fat" current={fat} goal={GOAL.fat} color="#C8673F" />
        </div>
      </div>
      <div className={styles.extras}>
        <div className={styles.extraBox}><p className={styles.extraVal}>{Math.round(fiber)}g</p><p className={styles.extraLabel}>Fiber</p></div>
        <div className={styles.extraBox}><p className={styles.extraVal}>{Math.round(sugar)}g</p><p className={styles.extraLabel}>Sugar</p></div>
      </div>
    </div>
  );
}

function MacroBar({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
  return (
    <div className={styles.macroItem}>
      <div className={styles.macroTop}>
        <span>{label}</span>
        <span className={styles.macroVals}>{Math.round(current)} / {goal}g</span>
      </div>
      <div className={styles.macroTrack}>
        <div className={styles.macroFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}