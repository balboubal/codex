// POST /api/save-meta  (keeper only) -> { title, subtitle, heroImage? }
import { sb, isDM, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!isDM(req)) return json(res, 401, { error: 'Not authorized' });
  try {
    const { title, subtitle, heroImage } = await readJson(req);
    const body = { title: String(title || 'The Unwritten Codex'), subtitle: String(subtitle || '') };
    if (heroImage !== undefined) body.hero_image = String(heroImage || '');
    await sb('settings?id=eq.1', { method: 'PATCH', body, prefer: 'return=minimal' });
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
