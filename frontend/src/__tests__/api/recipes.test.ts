import { createMocks } from 'node-mocks-http';
import recipesHandler from '@/pages/api/recipes/index';
import recipeByIdHandler from '@/pages/api/recipes/[id]';

// Mock db module
jest.mock('@/lib/db', () => {
  const recipes: any[] = [];
  const ingredients: any[] = [];
  const nutrition: any[] = [];
  let nextId = 1;
  let nextIngId = 1;
  let nextNutId = 1;

  return {
    isSupabase: () => false,
    getDb: () => ({
      prepare: (sql: string) => {
        if (sql.includes('SELECT') && sql.includes('FROM recipes') && !sql.includes('WHERE')) {
          return { all: () => recipes.map(r => ({ ...r })) };
        }
        if (sql.includes('SELECT') && sql.includes('FROM recipes') && sql.includes('WHERE category')) {
          return { all: (cat: string) => recipes.filter(r => r.category === cat).map(r => ({ ...r })) };
        }
        if (sql.includes('INSERT INTO recipes')) {
          return { run: (...args: any[]) => { const id = nextId++; recipes.push({ id, title: args[0], description: args[1], category: args[2], servings: args[3], prep_time_minutes: args[4], cook_time_minutes: args[5], instructions: args[6], image_url: args[7], created_at: new Date().toISOString() }); return { lastInsertRowid: id }; } };
        }
        if (sql.includes('INSERT INTO ingredients')) {
          return { run: (...args: any[]) => { ingredients.push({ id: nextIngId++, recipe_id: args[0], name: args[1], quantity: args[2], unit: args[3], aisle: args[4] }); } };
        }
        if (sql.includes('INSERT INTO nutrition')) {
          return { run: (...args: any[]) => { nutrition.push({ id: nextNutId++, recipe_id: args[0], calories: args[1], protein: args[2], carbs: args[3], fat: args[4], fiber: args[5], sugar: args[6] }); } };
        }
        if (sql.includes('SELECT * FROM recipes WHERE id')) {
          return { get: (id: number) => recipes.find(r => r.id === id) || null };
        }
        if (sql.includes('SELECT id FROM recipes WHERE id')) {
          return { get: (id: number) => recipes.find(r => r.id === id) ? { id } : null };
        }
        if (sql.includes('SELECT id, name') && sql.includes('ingredients')) {
          return { all: (id: number) => ingredients.filter(i => i.recipe_id === id) };
        }
        if (sql.includes('SELECT calories')) {
          return { get: (id: number) => nutrition.find(n => n.recipe_id === id) || null };
        }
        if (sql.includes('DELETE FROM recipes')) {
          return { run: (id: number) => { const idx = recipes.findIndex(r => r.id === id); if (idx >= 0) recipes.splice(idx, 1); } };
        }
        if (sql.includes('SELECT title FROM recipes')) {
          return { get: (id: number) => recipes.find(r => r.id === id) };
        }
        if (sql.includes('DELETE FROM ingredients')) {
          return { run: () => {} };
        }
        if (sql.includes('DELETE FROM nutrition')) {
          return { run: () => {} };
        }
        if (sql.includes('UPDATE recipes')) {
          return { run: (...args: any[]) => {} };
        }
        return { all: () => [], get: () => null, run: () => ({ lastInsertRowid: 0 }) };
      }
    })
  };
});

describe('GET /api/recipes', () => {
  it('returns empty array initially', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual([]);
  });
});

describe('POST /api/recipes', () => {
  it('creates a recipe', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'Test', servings: 2 } });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test');
    expect(data.id).toBeDefined();
  });

  it('returns 400 without title', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('GET /api/recipes/[id]', () => {
  it('returns 404 for non-existent', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '999' } });
    await recipeByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });
});

describe('DELETE /api/recipes/[id]', () => {
  it('returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await recipeByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});