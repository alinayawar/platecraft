import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      if (isSupabase()) {
        const { data: recipe, error } = await db.from('recipes').select('*').eq('id', id).single();
        if (error || !recipe) return res.status(404).json({ error: 'Not found' });
        const { data: ingredients } = await db.from('ingredients').select('id, name, quantity, unit, aisle').eq('recipe_id', id);
        const { data: nutrition } = await db.from('nutrition').select('calories, protein, carbs, fat, fiber, sugar').eq('recipe_id', id).single();
        return res.json({
          id: recipe.id, title: recipe.title, description: recipe.description, category: recipe.category,
          servings: recipe.servings, prepTimeMinutes: recipe.prep_time_minutes, cookTimeMinutes: recipe.cook_time_minutes,
          instructions: recipe.instructions, imageUrl: recipe.image_url,
          ingredients: ingredients || [], nutrition: nutrition || null
        });
      } else {
        const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
        if (!recipe) return res.status(404).json({ error: 'Not found' });
        const ingredients = db.prepare('SELECT id, name, quantity, unit, aisle FROM ingredients WHERE recipe_id = ?').all(id);
        const nutrition = db.prepare('SELECT calories, protein, carbs, fat, fiber, sugar FROM nutrition WHERE recipe_id = ?').get(id);
        return res.json({
          id: recipe.id, title: recipe.title, description: recipe.description, category: recipe.category,
          servings: recipe.servings, prepTimeMinutes: recipe.prep_time_minutes, cookTimeMinutes: recipe.cook_time_minutes,
          instructions: recipe.instructions, imageUrl: recipe.image_url,
          ingredients, nutrition: nutrition || null
        });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, description, category, servings, prepTimeMinutes, cookTimeMinutes, instructions, imageUrl, ingredients, nutrition } = req.body;
      if (isSupabase()) {
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (category !== undefined) updates.category = category;
        if (servings !== undefined) updates.servings = servings;
        if (prepTimeMinutes !== undefined) updates.prep_time_minutes = prepTimeMinutes;
        if (cookTimeMinutes !== undefined) updates.cook_time_minutes = cookTimeMinutes;
        if (instructions !== undefined) updates.instructions = instructions;
        if (imageUrl !== undefined) updates.image_url = imageUrl;
        const { data, error } = await db.from('recipes').update(updates).eq('id', id).select('id, title').single();
        if (error) return res.status(500).json({ error: error.message });
        if (!data) return res.status(404).json({ error: 'Not found' });

        if (ingredients) {
          await db.from('ingredients').delete().eq('recipe_id', id);
          if (ingredients.length) {
            await db.from('ingredients').insert(ingredients.map((i: any) => ({
              recipe_id: id, name: i.name, quantity: i.quantity || null, unit: i.unit || null, aisle: i.aisle || null
            })));
          }
        }
        if (nutrition) {
          await db.from('nutrition').delete().eq('recipe_id', id);
          await db.from('nutrition').insert({
            recipe_id: id, calories: nutrition.calories || null, protein: nutrition.protein || null,
            carbs: nutrition.carbs || null, fat: nutrition.fat || null, fiber: nutrition.fiber || null, sugar: nutrition.sugar || null
          });
        }
        return res.json({ id: data.id, title: data.title });
      } else {
        const existing = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Not found' });
        const fields: string[] = [];
        const values: any[] = [];
        if (title !== undefined) { fields.push('title = ?'); values.push(title); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (category !== undefined) { fields.push('category = ?'); values.push(category); }
        if (servings !== undefined) { fields.push('servings = ?'); values.push(servings); }
        if (prepTimeMinutes !== undefined) { fields.push('prep_time_minutes = ?'); values.push(prepTimeMinutes); }
        if (cookTimeMinutes !== undefined) { fields.push('cook_time_minutes = ?'); values.push(cookTimeMinutes); }
        if (instructions !== undefined) { fields.push('instructions = ?'); values.push(instructions); }
        if (imageUrl !== undefined) { fields.push('image_url = ?'); values.push(imageUrl); }
        if (fields.length) {
          values.push(id);
          db.prepare(`UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        }
        if (ingredients) {
          db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(id);
          const stmt = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (?, ?, ?, ?, ?)');
          for (const i of ingredients) stmt.run(id, i.name, i.quantity || null, i.unit || null, i.aisle || null);
        }
        if (nutrition) {
          db.prepare('DELETE FROM nutrition WHERE recipe_id = ?').run(id);
          db.prepare('INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            id, nutrition.calories || null, nutrition.protein || null, nutrition.carbs || null,
            nutrition.fat || null, nutrition.fiber || null, nutrition.sugar || null
          );
        }
        const updated = db.prepare('SELECT title FROM recipes WHERE id = ?').get(id);
        return res.json({ id, title: updated.title });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase()) {
        const { error } = await db.from('recipes').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
      } else {
        db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
        return res.json({ success: true });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
}