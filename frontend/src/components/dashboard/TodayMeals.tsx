import styles from './TodayMeals.module.css';

interface Meal {
  id: number;
  mealType: string;
  recipe: { id: number; title: string; imageUrl?: string | null };
  servings: number;
}

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export default function TodayMeals({ meals }: { meals: Meal[] }) {
  const sorted = MEAL_ORDER.map((type) => {
    const found = meals.find((m) => m.mealType === type);
    return { type, meal: found || null };
  });

  const nextMeal = sorted.find((s) => s.meal)?.meal;
  const imgUrl = nextMeal?.recipe?.imageUrl || 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&h=700&fit=crop';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={imgUrl} alt={nextMeal?.recipe?.title || 'Meal'} className={styles.image} />
        <div className={styles.imageOverlay} />
        <div className={styles.imageContent}>
          <span className={styles.badge}>Up next · {nextMeal?.mealType || 'No meal'}</span>
          <h2 className={styles.title}>{nextMeal?.recipe?.title || 'No meals planned'}</h2>
          {nextMeal && (
            <p className={styles.meta}>{nextMeal.servings} serving{nextMeal.servings !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>Today&apos;s meals</h3>
        </div>
        <ol className={styles.timeline}>
          {sorted.map(({ type, meal }) => (
            <li key={type} className={`${styles.slot} ${!meal ? styles.empty : ''}`}>
              <span className={meal ? styles.dotFilled : styles.dotEmpty} />
              <div className={styles.slotContent}>
                <p className={styles.slotType}>{type}</p>
                <p className={`${styles.slotName} ${!meal ? styles.mutedName : ''}`}>
                  {meal ? meal.recipe.title : 'Not planned'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}