# The Unwritten Codex — hosting guide

A searchable D&D campaign wiki. Reading is open to anyone with the link; adding, editing,
and revealing entries is gated behind a keeper (DM) passphrase that's enforced on the server.

- **Frontend:** one static `index.html` (no build step).
- **Backend:** small serverless functions in `/api`.
- **Database:** Supabase (Postgres).
- **Host:** Vercel.

You'll need free accounts at **supabase.com** and **vercel.com**. Total cost for a campaign
wiki: $0 — it sits well inside both free tiers.

---

## How the security works (worth understanding before you start)

The passphrase check happens in the serverless functions, not in the browser. Two consequences:

1. The Supabase **service-role key** and the **DM password** live only in your host's
   environment variables. They are never sent to a visitor's browser.
2. When a non-keeper loads the site, the server **strips hidden cards and hidden stats
   before sending the response**. A curious player can't find your secrets in the network
   tab, because they were never transmitted.

This is real protection, not the obfuscation the earlier prototype used.

---

## Step 1 — Create the Supabase project

1. Go to **supabase.com**, sign in, and click **New project**.
2. Give it a name, set a database password (you won't need it for this app — Supabase just
   requires one), pick a region close to you, and create it. Wait ~2 minutes for it to spin up.

## Step 2 — Create the tables

1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the included **`schema.sql`**, copy its entire contents into the editor, and click **Run**.
   This creates the `cards` and `settings` tables, locks them down with Row-Level Security,
   and inserts a handful of sample entries so the site isn't empty on first load.

## Step 3 — Copy your Supabase credentials

1. Open **Project Settings** (gear icon) → **API**.
2. Copy two values, you'll paste them into Vercel in Step 5:
   - **Project URL** — e.g. `https://abcdefghijklmnop.supabase.co` → this is `SUPABASE_URL`
   - **service_role** secret key (under *Project API keys*) → this is `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The **service_role** key is god-mode over your database. Keep it secret. Only ever paste
> it into Vercel's environment variables — never into the frontend, a repo, or a chat.

## Step 4 — Get the project onto Vercel

Pick whichever is easier for you.

**Option A — GitHub (recommended):**
1. Create a new GitHub repo and push this `codex-app` folder to it.
2. In Vercel, click **Add New… → Project**, import that repo.
3. When asked for **Framework Preset**, choose **Other**. Leave the Build Command and Output
   Directory **blank** — there's nothing to build.

**Option B — Vercel CLI (no GitHub):**
1. Install the CLI: `npm i -g vercel`
2. From inside the `codex-app` folder, run `vercel` and follow the prompts. Choose **Other**
   if asked about a framework.

## Step 5 — Set the environment variables

In your Vercel project: **Settings → Environment Variables**. Add these four (apply them to
Production, Preview, and Development):

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your Project URL from Step 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key from Step 3 |
| `DM_PASSWORD` | any passphrase you want the DM to type to unlock editing |
| `SESSION_SECRET` | any long random string (e.g. run `openssl rand -base64 32`) |

## Step 6 — Deploy

If you used GitHub, Vercel deploys automatically on every push — trigger one from the
**Deployments** tab if needed. If you used the CLI, run `vercel --prod`.

Open the deployment URL. You should see the search page with the sample entries.

## Step 7 — Become the keeper and start filling it in

1. Click **Keeper login** (top right) — or add `#keeper` to the URL — and enter your `DM_PASSWORD`.
2. Use **New entry** to add cards. For each stat, the eye toggle decides whether players see it;
   the **Visible to players** switch hides the whole entry until you flip it. The live preview
   has an *As player / As keeper* switch so you can confirm exactly what players will get.
3. Delete the sample cards once you've got your own.
4. Share the plain URL with your players. They get read-only access automatically — no login.

---

## Day-to-day notes

- **Change the DM passphrase:** update `DM_PASSWORD` in Vercel → Settings → Environment
  Variables, then redeploy. (It's an env var, so it doesn't live in the database.)
- **Rename the archive / change the subtitle:** do it in-app from the gear menu while logged in.
- **Backups:** the gear menu has **Export backup (.json)** and **Import backup**. Export grabs
  everything (including hidden entries, since you're the keeper); import upserts every card from
  a backup file, overwriting any with the same id.
- **Categories:** Items, NPCs, Locations, Creatures, Factions, Lore, Quests, Sessions. To change
  the set, edit the `CATS` array near the top of the `<script>` in `index.html` and redeploy.

## Troubleshooting

- **"Couldn't reach the archive" on load** → the env vars are missing or wrong. Re-check
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel, then redeploy.
- **Login always fails** → `DM_PASSWORD` isn't set in Vercel, or you're typing a different value.
  After setting/changing it, redeploy.
- **Index page 404s but `/api/cards` works** → your host isn't serving the root as static.
  Move `index.html` into a `public/` folder and redeploy.
- **Edits seem to do nothing** → open the browser console/network tab; a 401 from `/api/save-card`
  means your keeper session expired — just log in again.

## Files

```
codex-app/
  index.html            the whole frontend (UI + client logic)
  schema.sql            run once in Supabase to create tables + samples
  package.json          marks this as an ES-module project, no dependencies
  .env.example          the four env vars, for reference / local dev
  lib/
    util.js             shared server helpers (Supabase calls, auth cookie)
  api/
    cards.js            GET all cards (filters hidden content for non-keepers)
    save-card.js        POST upsert a card        (keeper only)
    delete-card.js      POST delete a card        (keeper only)
    save-meta.js        POST rename the archive   (keeper only)
    login.js            POST set the keeper cookie
    logout.js           POST clear the cookie
    session.js          GET  am I a keeper?
```
