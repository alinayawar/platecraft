import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      if (isSupabase()) {
        let query = db.from('recipes').select('id, title, description, category, servings, prep_time_minutes, cook_time_minutes, image_url, created_at').order('created_at', { ascending: false });
        if (category && typeof category === 'string') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data.map((r: any) => ({
          id: r.id, title: r.title, description: r.description, category: r.category,
          servings: r.servings, prepTimeMinutes: r.prep_time_minutes, cookTimeMinutes: r.cook_time_minutes,
          imageUrl: r.image_url, createdAt: r.created_at
        })));
      } else {
        let sql = 'SELECT * FROM recipes';
        const params: any[] = [];
        if (category && typeof category === 'string') {
          sql += ' WHERE category = ?';
          params.push(category);
        }
        sql += ' ORDER BY created_at DESC';
        const rows = db.prepare(sql).all(...params);
        return res.json(rows.map((r: any) => ({
          id: r.id, title: r.title, description: r.description, category: r.category,
          servings: r.servings, prepTimeMinutes: r.prep_time_minutes, cookTimeMinutes: r.cook_time_minutes,
          imageUrl: r.image_url, createdAt: r.created_at
        })));
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, category, servings, prepTimeMinutes, cookTimeMinutes, instructions, imageUrl, ingredients, nutrition } = req.body;
      if (!title) return res.status(400).json({ error: 'title is required' });

      if (isSupabase()) {
        const { data: recipe, error } = await db.from('recipes').insert({
          title, description: description || null, category: category || null,
          servings: servings || 1, prep_time_minutes: prepTimeMinutes || null,
          cook_time_minutes: cookTimeMinutes || null, instructions: instructions || null,
          image_url: imageUrl || null, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }).select('id, title').single();
        if (error) return res.status(500).json({ error: error.message });

        if (ingredients?.length) {
          await db.from('ingredients').insert(ingredients.map((i: any) => ({
            recipe_id: recipe.id, name: i.name, quantity: i.quantity || null,
            unit: i.unit || null, aisle: i.aisle || null
          })));
        }
        if (nutrition) {
          await db.from('nutrition').insert({
            recipe_id: recipe.id, calories: nutrition.calories || null,
            protein: nutrition.protein || null, carbs: nutrition.carbs || null,
            fat: nutrition.fat || null, fiber: nutrition.fiber || null, sugar: nutrition.sugar || null
          });
        }
        return res.status(201).json({ id: recipe.id, title: recipe.title });
      } else {
        const result = db.prepare(
          'INSERT INTO recipes (title, description, category, servings, prep_time_minutes, cook_time_minutes, instructions, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(title, description || null, category || null, servings || 1, prepTimeMinutes || null, cookTimeMinutes || null, instructions || null, imageUrl || null);
        const recipeId = result.lastInsertRowid;

        if (ingredients?.length) {
          const stmt = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (?, ?, ?, ?, ?)');
          for (const i of ingredients) {
            stmt.run(recipeId, i.name, i.quantity || null, i.unit || null, i.aisle || null);
          }
        }
        if (nutrition) {
          db.prepare('INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            recipeId, nutrition.calories || null, nutrition.protein || null, nutrition.carbs || null,
            nutrition.fat || null, nutrition.fiber || null, nutrition.sugar || null
          );
        }
        return res.status(201).json({ id: Number(recipeId), title });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}