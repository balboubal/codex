// Shared helpers for the serverless functions.
// Everything here runs ONLY on the server. The Supabase service-role key
// and the DM password are never sent to the browser.
import crypto from 'node:crypto';

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET || 'please-set-a-session-secret';
const DM_PASSWORD   = process.env.DM_PASSWORD || '';

// --- Supabase REST (PostgREST) call using the service-role key ---
export async function sb(path, { method = 'GET', body, prefer } = {}) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Supabase env vars are missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  const headers = {
    apikey: SERVICE_KEY,
    'Content-Type': 'application/json',
  };
  // Legacy service_role keys are JWTs (start with "eyJ") and also go in the Bearer header.
  // New-format secret keys (sb_secret_...) are NOT JWTs and must be sent via apikey only —
  // putting them in Authorization: Bearer gets them rejected by the gateway.
  if (SERVICE_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SERVICE_KEY}`;
  }
  if (prefer) headers['Prefer'] = prefer;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase ${res.status}: ${t}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- Session cookie (signed, httpOnly) ---
function token() {
  return crypto.createHmac('sha256', SESSION_SECRET).update('codex-dm-v1').digest('base64url');
}
export function isDM(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/(?:^|;\s*)codex_dm=([^;]+)/);
  if (!m) return false;
  const want = token();
  const got = m[1];
  if (got.length !== want.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want)); }
  catch { return false; }
}
export function checkPassword(pw) {
  if (!DM_PASSWORD) return false;
  const a = Buffer.from(String(pw ?? ''));
  const b = Buffer.from(DM_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
export function setSession(res) {
  res.setHeader('Set-Cookie',
    `codex_dm=${token()}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`);
}
export function clearSession(res) {
  res.setHeader('Set-Cookie',
    `codex_dm=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

// --- request/response helpers ---
export async function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
export function json(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}
