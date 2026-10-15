import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      servings INTEGER NOT NULL DEFAULT 1,
      prep_time_minutes INTEGER,
      cook_time_minutes INTEGER,
      instructions TEXT,
      image_url VARCHAR(500),
      created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2),
      unit VARCHAR(50),
      aisle VARCHAR(100),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS nutrition (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL UNIQUE,
      calories DECIMAL(10,2),
      protein DECIMAL(10,2),
      carbs DECIMAL(10,2),
      fat DECIMAL(10,2),
      fiber DECIMAL(10,2),
      sugar DECIMAL(10,2),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      date DATE NOT NULL,
      meal_type VARCHAR(20) NOT NULL,
      servings INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2),
      unit VARCHAR(50),
      aisle VARCHAR(100),
      checked BOOLEAN NOT NULL DEFAULT 0,
      week_start DATE NOT NULL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO recipes (title, description, category, servings, prep_time_minutes, cook_time_minutes, instructions, image_url)
      VALUES ('Overnight Oats', 'Healthy make-ahead breakfast', 'Breakfast', 2, 10, 0, 'Mix oats with milk, refrigerate overnight.', NULL);
      INSERT INTO recipes (title, description, category, servings, prep_time_minutes, cook_time_minutes, instructions, image_url)
      VALUES ('Grilled Chicken Salad', 'Fresh and protein-packed lunch', 'Lunch', 1, 15, 20, 'Grill chicken, toss with greens and dressing.', NULL);
      INSERT INTO recipes (title, description, category, servings, prep_time_minutes, cook_time_minutes, instructions, image_url)
      VALUES ('Pasta Primavera', 'Classic veggie pasta dinner', 'Dinner', 4, 10, 25, 'Cook pasta, sauté vegetables, combine with sauce.', NULL);
    `);
    const recipes = db.prepare('SELECT id FROM recipes ORDER BY id').all();
    if (recipes.length >= 3) {
      db.exec(`
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[0].id}, 'Rolled Oats', 1.0, 'cup', 'Grains');
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[0].id}, 'Milk', 1.0, 'cup', 'Dairy');
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[1].id}, 'Chicken Breast', 200.0, 'g', 'Meat');
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[1].id}, 'Mixed Greens', 3.0, 'cups', 'Produce');
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[2].id}, 'Penne Pasta', 400.0, 'g', 'Grains');
        INSERT INTO ingredients (recipe_id, name, quantity, unit, aisle) VALUES (${recipes[2].id}, 'Bell Pepper', 2.0, 'whole', 'Produce');
        INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar) VALUES (${recipes[0].id}, 350, 12, 55, 8, 6, 10);
        INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar) VALUES (${recipes[1].id}, 420, 38, 12, 18, 4, 3);
        INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat, fiber, sugar) VALUES (${recipes[2].id}, 520, 15, 72, 14, 5, 8);
      `);
    }
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}