INSERT INTO recipes (title, slug, description, category, servings, prep_time_minutes, cook_time_minutes, instructions)
VALUES ('Overnight Oats', 'overnight-oats', 'Healthy make-ahead breakfast', 'Breakfast', 2, 10, 0, 'Mix oats with milk, refrigerate overnight.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, category, servings, prep_time_minutes, cook_time_minutes, instructions)
VALUES ('Grilled Chicken Salad', 'grilled-chicken-salad', 'Fresh and protein-packed lunch', 'Lunch', 1, 15, 20, 'Grill chicken, toss with greens and dressing.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipes (title, slug, description, category, servings, prep_time_minutes, cook_time_minutes, instructions)
VALUES ('Pasta Primavera', 'pasta-primavera', 'Classic veggie pasta dinner', 'Dinner', 4, 10, 25, 'Cook pasta, sauté vegetables, combine with sauce.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Rolled Oats', 1.0, 'cup', 'Grains' FROM recipes WHERE slug='overnight-oats'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='overnight-oats') AND name='Rolled Oats');

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Milk', 1.0, 'cup', 'Dairy' FROM recipes WHERE slug='overnight-oats'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='overnight-oats') AND name='Milk');

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Chicken Breast', 200.0, 'g', 'Meat' FROM recipes WHERE slug='grilled-chicken-salad'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='grilled-chicken-salad') AND name='Chicken Breast');

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Mixed Greens', 3.0, 'cups', 'Produce' FROM recipes WHERE slug='grilled-chicken-salad'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='grilled-chicken-salad') AND name='Mixed Greens');

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Penne Pasta', 400.0, 'g', 'Grains' FROM recipes WHERE slug='pasta-primavera'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='pasta-primavera') AND name='Penne Pasta');

INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle)
SELECT id, 'Bell Pepper', 2.0, 'whole', 'Produce' FROM recipes WHERE slug='pasta-primavera'
AND NOT EXISTS (SELECT 1 FROM ingredients WHERE recipe_id=(SELECT id FROM recipes WHERE slug='pasta-primavera') AND name='Bell Pepper');

INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar)
SELECT id, 350, 12, 55, 8, 6, 10 FROM recipes WHERE slug='overnight-oats'
ON CONFLICT (recipe_id) DO NOTHING;

INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar)
SELECT id, 420, 38, 12, 18, 4, 3 FROM recipes WHERE slug='grilled-chicken-salad'
ON CONFLICT (recipe_id) DO NOTHING;

INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar)
SELECT id, 520, 15, 72, 14, 5, 8 FROM recipes WHERE slug='pasta-primavera'
ON CONFLICT (recipe_id) DO NOTHING;