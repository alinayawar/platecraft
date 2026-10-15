import type { Recipe, Ingredient, Nutrition, MealPlan, GroceryItem, DailyNutrition } from '@/types';

describe('Types', () => {
  it('Recipe interface has required fields', () => {
    const r: Recipe = { id: 1, title: 'Test', servings: 2 };
    expect(r.id).toBe(1);
    expect(r.title).toBe('Test');
  });

  it('GroceryItem has checked field', () => {
    const g: GroceryItem = { id: 1, name: 'Milk', checked: false, weekStart: '2025-01-01' };
    expect(g.checked).toBe(false);
  });

  it('DailyNutrition has all macro fields', () => {
    const d: DailyNutrition = { date: '2025-01-01', calories: 2000, protein: 100, carbs: 250, fat: 80, fiber: 30, sugar: 40 };
    expect(d.calories).toBe(2000);
  });
});