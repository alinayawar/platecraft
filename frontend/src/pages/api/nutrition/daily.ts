import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const db = getDb();
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });

  try {
    if (isSupabase()) {
      const { data: plans } = await db.from('meal_plans').select('recipe_id, date, servings').gte('date', startDate).lte('date', endDate as string);
      if (!plans?.length) return res.json([]);
      const recipeIds = [...new Set(plans.map((p: any) => p.recipe_id))];
      const { data: nutritionData } = await db.from('nutrition').select('*').in('recipe_id', recipeIds);
      const { data: recipes } = await db.from('recipes').select('id, servings').in('id', recipeIds);
      const recipeServings: Record<number, number> = {};
      for (const r of (recipes || [])) recipeServings[r.id] = r.servings || 1;
      const nutMap: Record<number, any> = {};
      for (const n of (nutritionData || [])) nutMap[n.recipe_id] = n;

      const daily: Record<string, any> = {};
      for (const p of plans) {
        if (!daily[p.date]) daily[p.date] = { date: p.date, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
        const n = nutMap[p.recipe_id];
        if (n) {
          const ratio = (p.servings || 1) / (recipeServings[p.recipe_id] || 1);
          daily[p.date].calories += (n.calories || 0) * ratio;
          daily[p.date].protein += (n.protein || 0) * ratio;
          daily[p.date].carbs += (n.carbs || 0) * ratio;
          daily[p.date].fat += (n.fat || 0) * ratio;
          daily[p.date].fiber += (n.fiber || 0) * ratio;
          daily[p.date].sugar += (n.sugar || 0) * ratio;
        }
      }
      return res.json(Object.values(daily).sort((a: any, b: any) => a.date.localeCompare(b.date)));
    } else {
      const plans = db.prepare('SELECT recipe_id, date, servings FROM meal_plans WHERE date >= ? AND date <= ?').all(startDate, endDate);
      if (!plans.length) return res.json([]);
      const recipeIds = [...new Set(plans.map((p: any) => p.recipe_id))];
      const ph = recipeIds.map(() => '?').join(',');
      const nutritionData = db.prepare(`SELECT * FROM nutrition WHERE recipe_id IN (${ph})`).all(...recipeIds);
      const recipesData = db.prepare(`SELECT id, servings FROM recipes WHERE id IN (${ph})`).all(...recipeIds);
      const recipeServings: Record<number, number> = {};
      for (const r of recipesData) recipeServings[(r as any).id] = (r as any).servings || 1;
      const nutMap: Record<number, any> = {};
      for (const n of nutritionData) nutMap[(n as any).recipe_id] = n;

      const daily: Record<string, any> = {};
      for (const p of plans as any[]) {
        if (!daily[p.date]) daily[p.date] = { date: p.date, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
        const n = nutMap[p.recipe_id];
        if (n) {
          const ratio = (p.servings || 1) / (recipeServings[p.recipe_id] || 1);
          daily[p.date].calories += (n.calories || 0) * ratio;
          daily[p.date].protein += (n.protein || 0) * ratio;
          daily[p.date].carbs += (n.carbs || 0) * ratio;
          daily[p.date].fat += (n.fat || 0) * ratio;
          daily[p.date].fiber += (n.fiber || 0) * ratio;
          daily[p.date].sugar += (n.sugar || 0) * ratio;
        }
      }
      return res.json(Object.values(daily).sort((a: any, b: any) => a.date.localeCompare(b.date)));
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}