// POST /api/save-categories  (keeper only) -> { categories: [{key,label,hue,icon}] }
import { sb, isDM, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!isDM(req)) return json(res, 401, { error: 'Not authorized' });
  try {
    const { categories } = await readJson(req);
    if (!Array.isArray(categories) || categories.length === 0) {
      return json(res, 400, { error: 'Provide at least one category.' });
    }
    const clean = categories
      .filter((c) => c && c.key && String(c.label || '').trim())
      .map((c) => ({
        key: String(c.key),
        label: String(c.label).trim(),
        hue: String(c.hue || '#8A93A8'),
        icon: String(c.icon || 'scroll'),
      }));
    if (!clean.length) return json(res, 400, { error: 'Categories need names.' });
    await sb('settings?id=eq.1', { method: 'PATCH', body: { categories: clean }, prefer: 'return=minimal' });
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
