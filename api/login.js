// POST /api/login -> { password }. Sets the signed DM cookie on success.
import { checkPassword, setSession, readJson, json } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const { password } = await readJson(req);
  if (checkPassword(password)) {
    setSession(res);
    return json(res, 200, { ok: true });
  }
  return json(res, 401, { error: 'Wrong passphrase' });
}
