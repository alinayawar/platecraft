import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      const { weekStart } = req.query;
      if (isSupabase()) {
        let query = db.from('meal_plans').select('id, recipe_id, date, meal_type, servings');
        if (weekStart && typeof weekStart === 'string') {
          const end = new Date(weekStart);
          end.setDate(end.getDate() + 6);
          query = query.gte('date', weekStart).lte('date', end.toISOString().split('T')[0]);
        }
        const { data: plans, error } = await query.order('date');
        if (error) return res.status(500).json({ error: error.message });
        const recipeIds = [...new Set((plans || []).map((p: any) => p.recipe_id))];
        let recipesMap: Record<number, any> = {};
        if (recipeIds.length) {
          const { data: recipes } = await db.from('recipes').select('id, title, image_url').in('id', recipeIds);
          for (const r of (recipes || [])) recipesMap[r.id] = r;
        }
        return res.json((plans || []).map((p: any) => ({
          id: p.id, recipeId: p.recipe_id, date: p.date, mealType: p.meal_type, servings: p.servings,
          recipe: recipesMap[p.recipe_id] ? { id: recipesMap[p.recipe_id].id, title: recipesMap[p.recipe_id].title, imageUrl: recipesMap[p.recipe_id].image_url } : null
        })));
      } else {
        let sql = 'SELECT mp.*, r.title as recipe_title, r.image_url as recipe_image_url FROM meal_plans mp LEFT JOIN recipes r ON mp.recipe_id = r.id';
        const params: any[] = [];
        if (weekStart && typeof weekStart === 'string') {
          const end = new Date(weekStart);
          end.setDate(end.getDate() + 6);
          sql += ' WHERE mp.date >= ? AND mp.date <= ?';
          params.push(weekStart, end.toISOString().split('T')[0]);
        }
        sql += ' ORDER BY mp.date';
        const rows = db.prepare(sql).all(...params);
        return res.json(rows.map((r: any) => ({
          id: r.id, recipeId: r.recipe_id, date: r.date, mealType: r.meal_type, servings: r.servings,
          recipe: { id: r.recipe_id, title: r.recipe_title, imageUrl: r.recipe_image_url }
        })));
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { recipeId, date, mealType, servings } = req.body;
      if (!recipeId || !date || !mealType) return res.status(400).json({ error: 'recipeId, date, mealType required' });
      if (isSupabase()) {
        const { data, error } = await db.from('meal_plans').insert({
          recipe_id: recipeId, date, meal_type: mealType, servings: servings || 1
        }).select('id, recipe_id, date, meal_type, servings').single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ id: data.id, recipeId: data.recipe_id, date: data.date, mealType: data.meal_type, servings: data.servings });
      } else {
        const result = db.prepare('INSERT INTO meal_plans (recipe_id, date, meal_type, servings) VALUES (?, ?, ?, ?)').run(recipeId, date, mealType, servings || 1);
        return res.status(201).json({ id: Number(result.lastInsertRowid), recipeId, date, mealType, servings: servings || 1 });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}