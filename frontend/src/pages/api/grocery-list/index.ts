import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const db = getDb();
  const { weekStart } = req.query;
  try {
    if (isSupabase()) {
      let query = db.from('grocery_items').select('*');
      if (weekStart && typeof weekStart === 'string') query = query.eq('week_start', weekStart);
      const { data, error } = await query.order('aisle');
      if (error) return res.status(500).json({ error: error.message });
      return res.json((data || []).map((g: any) => ({
        id: g.id, name: g.name, quantity: g.quantity, unit: g.unit, aisle: g.aisle, checked: g.checked, weekStart: g.week_start
      })));
    } else {
      let sql = 'SELECT * FROM grocery_items';
      const params: any[] = [];
      if (weekStart && typeof weekStart === 'string') { sql += ' WHERE week_start = ?'; params.push(weekStart); }
      sql += ' ORDER BY aisle';
      const rows = db.prepare(sql).all(...params);
      return res.json(rows.map((g: any) => ({
        id: g.id, name: g.name, quantity: g.quantity, unit: g.unit, aisle: g.aisle, checked: !!g.checked, weekStart: g.week_start
      })));
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}