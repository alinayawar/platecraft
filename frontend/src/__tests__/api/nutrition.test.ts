import { createMocks } from 'node-mocks-http';
import nutritionHandler from '@/pages/api/nutrition/daily';

jest.mock('@/lib/db', () => ({
  isSupabase: () => false,
  getDb: () => ({
    prepare: (sql: string) => {
      if (sql.includes('SELECT recipe_id, date')) {
        return { all: () => [] };
      }
      return { all: () => [], get: () => null };
    }
  })
}));

describe('GET /api/nutrition/daily', () => {
  it('returns 400 without dates', async () => {
    const { req, res } = createMocks({ method: 'GET', query: {} });
    await nutritionHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns empty array for date range with no plans', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { startDate: '2025-01-06', endDate: '2025-01-12' } });
    await nutritionHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual([]);
  });
});