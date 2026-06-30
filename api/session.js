// GET /api/session -> { dm: true|false }
import { isDM, json } from '../lib/util.js';

export default async function handler(req, res) {
  return json(res, 200, { dm: isDM(req) });
}
