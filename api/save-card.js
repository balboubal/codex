// POST /api/save-card  (DM only) -> upserts one card by id
import { sb, isDM, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!isDM(req)) return json(res, 401, { error: 'Not authorized' });
  try {
    const c = await readJson(req);
    if (!c || !c.id || !String(c.name || '').trim()) {
      return json(res, 400, { error: 'A card needs an id and a name.' });
    }
    const row = {
      id: String(c.id),
      name: String(c.name).trim(),
      category: String(c.category || 'items'),
      image: String(c.image || ''),
      visible: c.visible !== false,
      description: String(c.description || ''),
      stats: Array.isArray(c.stats) ? c.stats : [],
      updated_at: new Date().toISOString(),
    };
    await sb('cards?on_conflict=id', {
      method: 'POST',
      body: row,
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
