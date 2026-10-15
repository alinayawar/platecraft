import { createMocks } from 'node-mocks-http';
import mealPlansHandler from '@/pages/api/meal-plans/index';
import mealPlanByIdHandler from '@/pages/api/meal-plans/[id]';

jest.mock('@/lib/db', () => {
  const plans: any[] = [];
  let nextId = 1;
  return {
    isSupabase: () => false,
    getDb: () => ({
      prepare: (sql: string) => {
        if (sql.includes('SELECT mp.*')) {
          return { all: () => plans.map(p => ({ ...p, recipe_title: 'Test', recipe_image_url: null })) };
        }
        if (sql.includes('INSERT INTO meal_plans')) {
          return { run: (...args: any[]) => { const id = nextId++; plans.push({ id, recipe_id: args[0], date: args[1], meal_type: args[2], servings: args[3] }); return { lastInsertRowid: id }; } };
        }
        if (sql.includes('DELETE FROM meal_plans')) {
          return { run: (id: number) => { const idx = plans.findIndex(p => p.id === id); if (idx >= 0) plans.splice(idx, 1); } };
        }
        return { all: () => [], get: () => null, run: () => ({}) };
      }
    })
  };
});

describe('POST /api/meal-plans', () => {
  it('creates a meal plan', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { recipeId: 1, date: '2025-01-06', mealType: 'Lunch' } });
    await mealPlansHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.mealType).toBe('Lunch');
  });

  it('returns 400 without required fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await mealPlansHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('DELETE /api/meal-plans/[id]', () => {
  it('deletes successfully', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await mealPlanByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});