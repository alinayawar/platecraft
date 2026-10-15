import styles from './StatCards.module.css';

interface Props {
  mealsPlanned: number;
  totalSlots: number;
  groceryTotal: number;
  groceryLeft: number;
  nutrition: { protein: number }[];
}

export default function StatCards({ mealsPlanned, totalSlots, groceryTotal, groceryLeft, nutrition }: Props) {
  const avgProtein = nutrition.length > 0
    ? Math.round(nutrition.reduce((s, n) => s + n.protein, 0) / nutrition.length)
    : 0;

  return (
    <section className={styles.grid}>
      <div className={styles.card}>
        <p className={styles.label}>Meals planned</p>
        <p className={styles.value}>{mealsPlanned}<span className={styles.sub}>/{totalSlots}</span></p>
        <p className={styles.note}>{totalSlots - mealsPlanned} slots open this week</p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Grocery items</p>
        <p className={styles.value}>{groceryTotal}</p>
        <p className={styles.note}>
          {groceryLeft > 0 ? (
            <span className={styles.actionBadge}>{groceryLeft} to buy</span>
          ) : 'All done'}
        </p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Avg. daily protein</p>
        <p className={styles.value}>{avgProtein}g</p>
        <p className={styles.noteGreen}>This week</p>
      </div>
      <div className={styles.card}>
        <p className={styles.label}>Recipes saved</p>
        <p className={styles.value}>—</p>
        <p className={styles.noteMuted}>Browse recipes</p>
      </div>
    </section>
  );
}