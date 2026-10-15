import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const db = getDb();
  const { weekStart } = req.body;
  if (!weekStart) return res.status(400).json({ error: 'weekStart required' });

  try {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().split('T')[0];

    if (isSupabase()) {
      // Delete existing items for this week
      await db.from('grocery_items').delete().eq('week_start', weekStart);
      // Get meal plans for the week
      const { data: plans } = await db.from('meal_plans').select('recipe_id, servings').gte('date', weekStart).lte('date', end);
      if (!plans?.length) return res.json([]);
      // Get ingredients for those recipes
      const recipeIds = [...new Set(plans.map((p: any) => p.recipe_id))];
      const { data: ingredients } = await db.from('ingredients').select('*').in('recipe_id', recipeIds);
      // Get recipe servings for ratio
      const { data: recipes } = await db.from('recipes').select('id, servings').in('id', recipeIds);
      const recipeServingsMap: Record<number, number> = {};
      for (const r of (recipes || [])) recipeServingsMap[r.id] = r.servings || 1;
      // Aggregate
      const agg: Record<string, { quantity: number; unit: string | null; aisle: string | null }> = {};
      for (const plan of plans) {
        const ratio = (plan.servings || 1) / (recipeServingsMap[plan.recipe_id] || 1);
        for (const ing of (ingredients || []).filter((i: any) => i.recipe_id === plan.recipe_id)) {
          const key = `${ing.name}||${ing.unit || ''}`;
          if (!agg[key]) agg[key] = { quantity: 0, unit: ing.unit, aisle: ing.aisle };
          agg[key].quantity += (ing.quantity || 0) * ratio;
        }
      }
      const inserts = Object.entries(agg).map(([key, val]) => ({
        name: key.split('||')[0], quantity: Math.round(val.quantity * 100) / 100 || null,
        unit: val.unit, aisle: val.aisle, checked: false, week_start: weekStart
      }));
      if (inserts.length) {
        const { data: items, error } = await db.from('grocery_items').insert(inserts).select('id, name, quantity, unit, aisle, checked');
        if (error) return res.status(500).json({ error: error.message });
        return res.json((items || []).map((g: any) => ({ id: g.id, name: g.name, quantity: g.quantity, unit: g.unit, aisle: g.aisle, checked: g.checked })));
      }
      return res.json([]);
    } else {
      db.prepare('DELETE FROM grocery_items WHERE week_start = ?').run(weekStart);
      const plans = db.prepare('SELECT recipe_id, servings FROM meal_plans WHERE date >= ? AND date <= ?').all(weekStart, end);
      if (!plans.length) return res.json([]);
      const recipeIds = [...new Set(plans.map((p: any) => p.recipe_id))];
      const placeholders = recipeIds.map(() => '?').join(',');
      const ingredients = db.prepare(`SELECT * FROM ingredients WHERE recipe_id IN (${placeholders})`).all(...recipeIds);
      const recipes = db.prepare(`SELECT id, servings FROM recipes WHERE id IN (${placeholders})`).all(...recipeIds);
      const recipeServingsMap: Record<number, number> = {};
      for (const r of recipes) recipeServingsMap[(r as any).id] = (r as any).servings || 1;
      const agg: Record<string, { quantity: number; unit: string | null; aisle: string | null }> = {};
      for (const plan of plans) {
        const p = plan as any;
        const ratio = (p.servings || 1) / (recipeServingsMap[p.recipe_id] || 1);
        for (const ing of ingredients.filter((i: any) => i.recipe_id === p.recipe_id)) {
          const i = ing as any;
          const key = `${i.name}||${i.unit || ''}`;
          if (!agg[key]) agg[key] = { quantity: 0, unit: i.unit, aisle: i.aisle };
          agg[key].quantity += (i.quantity || 0) * ratio;
        }
      }
      const stmt = db.prepare('INSERT INTO grocery_items (name, quantity, unit, aisle, checked, week_start) VALUES (?, ?, ?, ?, 0, ?)');
      const result: any[] = [];
      for (const [key, val] of Object.entries(agg)) {
        const name = key.split('||')[0];
        const r = stmt.run(name, Math.round(val.quantity * 100) / 100 || null, val.unit, val.aisle, weekStart);
        result.push({ id: Number(r.lastInsertRowid), name, quantity: Math.round(val.quantity * 100) / 100 || null, unit: val.unit, aisle: val.aisle, checked: false });
      }
      return res.json(result);
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}