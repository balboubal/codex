-- =============================================================
--  The Unwritten Codex — database schema
--  Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- =============================================================

-- ---------- Tables ----------
create table if not exists cards (
  id          text primary key,
  name        text        not null default '',
  category    text        not null default 'items',
  image       text        not null default '',
  visible     boolean     not null default true,
  description text        not null default '',
  stats       jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists settings (
  id       int  primary key default 1,
  title    text not null default 'The Unwritten Codex',
  subtitle text not null default 'Archive of a living world',
  constraint settings_singleton check (id = 1)
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ---------- Lock everything down ----------
-- With RLS enabled and NO policies, the public/anon role can do nothing.
-- Your serverless functions use the service_role key, which bypasses RLS,
-- so all reads and writes go through your password-protected API instead.
alter table cards    enable row level security;
alter table settings enable row level security;

-- ---------- Sample entries (delete these once you start your own) ----------
insert into cards (id, name, category, image, visible, description, stats) values
(
  'seed-emberglass', 'Emberglass Dagger', 'items', '', true,
  'A slim blade of blackened glass that holds a single ember at its core. Warm to the touch, it never cools — and never quite stops whispering.',
  '[
    {"id":"a1","label":"Damage","value":"1d4 + 1 fire","visible":true},
    {"id":"a2","label":"Properties","value":"Finesse, Light","visible":true},
    {"id":"a3","label":"Attunement","value":"Required","visible":true},
    {"id":"a4","label":"True Origin","value":"Forged from a dying star","visible":false},
    {"id":"a5","label":"Curse","value":"Demands one secret per night","visible":false}
  ]'::jsonb
),
(
  'seed-seraphine', 'Seraphine Vance', 'npcs', '', true,
  'Keeper of the Lower Archive. Quiet, exact, and unfailingly polite. She remembers every face that passes her desk.',
  '[
    {"id":"b1","label":"Role","value":"Archivist","visible":true},
    {"id":"b2","label":"Disposition","value":"Wary, helpful","visible":true},
    {"id":"b3","label":"Hidden Loyalty","value":"Agent of the Ashen Court","visible":false},
    {"id":"b4","label":"Leverage","value":"Owes a blood-debt to the party","visible":false}
  ]'::jsonb
),
(
  'seed-spire', 'The Drowned Spire', 'locations', '', true,
  'A tower that sank but refused to fall. At low tide its upper windows breach the water, lit from within by something that should have drowned long ago.',
  '[
    {"id":"c1","label":"Region","value":"Saltmarsh Reach","visible":true},
    {"id":"c2","label":"Threat","value":"High","visible":true},
    {"id":"c3","label":"Vault","value":"Holds the second Codex Key","visible":false}
  ]'::jsonb
),
(
  'seed-stag', 'Hollow Stag', 'bestiary', '', true,
  'Antlered, eyeless, and silent. It walks the old forest paths as if it still remembers being alive.',
  '[
    {"id":"d1","label":"Challenge","value":"CR 5","visible":true},
    {"id":"d2","label":"Speed","value":"50 ft.","visible":true},
    {"id":"d3","label":"Hit Points","value":"76 (9d10 + 27)","visible":false},
    {"id":"d4","label":"Weakness","value":"Silvered weapons","visible":false}
  ]'::jsonb
),
(
  'seed-court', 'The Ashen Court', 'factions', '', false,
  'They do not advertise. By the time you know the Court is interested in you, the decision has already been made.',
  '[
    {"id":"e1","label":"Reach","value":"Three kingdoms, unseen","visible":false},
    {"id":"e2","label":"True Goal","value":"Unmake the Final Seal","visible":false}
  ]'::jsonb
)
on conflict (id) do nothing;
