// POST /api/delete-card  (DM only) -> { id }
import { sb, isDM, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!isDM(req)) return json(res, 401, { error: 'Not authorized' });
  try {
    const { id } = await readJson(req);
    if (!id) return json(res, 400, { error: 'Missing id' });
    await sb(`cards?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
