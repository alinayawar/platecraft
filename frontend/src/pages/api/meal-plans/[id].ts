import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') { res.setHeader('Allow', 'DELETE'); return res.status(405).end(); }
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    if (isSupabase()) {
      const { error } = await db.from('meal_plans').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    } else {
      db.prepare('DELETE FROM meal_plans WHERE id = ?').run(id);
    }
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}