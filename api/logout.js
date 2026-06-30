// POST /api/logout -> clears the DM cookie.
import { clearSession, json } from '../lib/util.js';

export default async function handler(req, res) {
  clearSession(res);
  return json(res, 200, { ok: true });
}
