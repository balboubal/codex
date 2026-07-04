// GET /api/cards -> { cards, meta, categories, dm }
// Public. Non-keepers get hidden cards removed and hidden stats stripped
// before the response is sent, so secrets never reach a player's browser.
import { sb, isDM, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const dm = isDM(req);
    const cards = (await sb('cards?select=*&order=updated_at.desc')) || [];
    const settings = (await sb('settings?id=eq.1&select=*')) || [];
    const s = settings[0] || {};
    const meta = {
      title: s.title || 'The Unwritten Codex',
      subtitle: s.subtitle || 'Archive of a living world',
      heroImage: s.hero_image || '',
    };
    const categories = Array.isArray(s.categories) ? s.categories : [];

    let out = cards;
    if (!dm) {
      out = cards
        .filter((c) => c.visible)
        .map((c) => ({ ...c, stats: Array.isArray(c.stats) ? c.stats.filter((x) => x.visible) : [] }));
    }
    return json(res, 200, { cards: out, meta, categories, dm });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}
