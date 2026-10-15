import { createMocks } from 'node-mocks-http';
import groceryHandler from '@/pages/api/grocery-list/index';
import groceryPatchHandler from '@/pages/api/grocery-list/[id]';

jest.mock('@/lib/db', () => ({
  isSupabase: () => false,
  getDb: () => ({
    prepare: (sql: string) => {
      if (sql.includes('SELECT * FROM grocery_items')) {
        return { all: () => [] };
      }
      if (sql.includes('UPDATE grocery_items')) {
        return { run: () => {} };
      }
      return { all: () => [], get: () => null, run: () => ({}) };
    }
  })
}));

describe('GET /api/grocery-list', () => {
  it('returns empty array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual([]);
  });
});

describe('PATCH /api/grocery-list/[id]', () => {
  it('toggles checked', async () => {
    const { req, res } = createMocks({ method: 'PATCH', query: { id: '1' }, body: { checked: true } });
    await groceryPatchHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ id: 1, checked: true });
  });

  it('returns 400 without checked boolean', async () => {
    const { req, res } = createMocks({ method: 'PATCH', query: { id: '1' }, body: {} });
    await groceryPatchHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});