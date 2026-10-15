import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).end(); }
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const { checked } = req.body;
  if (typeof checked !== 'boolean') return res.status(400).json({ error: 'checked (boolean) required' });

  try {
    if (isSupabase()) {
      const { data, error } = await db.from('grocery_items').update({ checked }).eq('id', id).select('id, checked').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ id: data.id, checked: data.checked });
    } else {
      db.prepare('UPDATE grocery_items SET checked = ? WHERE id = ?').run(checked ? 1 : 0, id);
      return res.json({ id, checked });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}