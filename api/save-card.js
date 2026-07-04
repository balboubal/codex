// POST /api/save-card  (keeper only) -> upserts one card by id
import { sb, isDM, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!isDM(req)) return json(res, 401, { error: 'Not authorized' });
  try {
    const c = await readJson(req);
    if (!c || !c.id || !String(c.name || '').trim()) {
      return json(res, 400, { error: 'A card needs an id and a name.' });
    }
    const cats = Array.isArray(c.categories) ? c.categories.map(String).filter(Boolean)
              : (c.category ? [String(c.category)] : []);
    const fit = (c.imageFit || c.image_fit) === 'contain' ? 'contain' : 'cover';
    const row = {
      id: String(c.id),
      name: String(c.name).trim(),
      category: cats[0] || 'items',              // kept in sync for backward compatibility
      categories: cats,
      tags: Array.isArray(c.tags) ? c.tags.map(String).filter(Boolean) : [],
      image: String(c.image || ''),
      image_fit: fit,
      image_pos: String(c.imagePos || c.image_pos || '50% 50%'),
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
