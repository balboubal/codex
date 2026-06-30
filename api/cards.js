// GET /api/cards  -> returns { cards, meta, dm }
// Public endpoint. If the visitor is NOT an authenticated DM, hidden cards
// are removed and hidden stats are stripped BEFORE sending — so players can't
// see secret content even by inspecting the network response.
import { sb, isDM, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const dm = isDM(req);
    const cards = (await sb('cards?select=*&order=updated_at.desc')) || [];
    const settings = (await sb('settings?id=eq.1&select=*')) || [];
    const meta = settings[0] || { title: 'The Unwritten Codex', subtitle: 'Archive of a living world' };

    let out = cards;
    if (!dm) {
      out = cards
        .filter((c) => c.visible)
        .map((c) => ({
          ...c,
          stats: Array.isArray(c.stats) ? c.stats.filter((s) => s.visible) : [],
        }));
    }
    return json(res, 200, { cards: out, meta: { title: meta.title, subtitle: meta.subtitle }, dm });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
