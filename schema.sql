-- =============================================================
--  The Unwritten Codex — database schema (fresh install)
--  Run once in Supabase > SQL Editor > New query.
--  (If you already have an older Codex database, run migration.sql instead.)
-- =============================================================

-- ---------- Tables ----------
create table if not exists cards (
  id          text primary key,
  name        text        not null default '',
  category    text        not null default 'items',   -- primary category (categories[0])
  categories  jsonb       not null default '[]'::jsonb,
  tags        jsonb       not null default '[]'::jsonb,
  image       text        not null default '',
  image_fit   text        not null default 'cover',    -- 'cover' | 'contain'
  image_pos   text        not null default '50% 50%',  -- object-position focal point
  visible     boolean     not null default true,
  description text        not null default '',
  stats       jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists settings (
  id         int  primary key default 1,
  title      text not null default 'The Unwritten Codex',
  subtitle   text not null default 'Archive of a living world',
  hero_image text,
  categories jsonb,
  constraint settings_singleton check (id = 1)
);

insert into settings (id, hero_image, categories) values (
  1,
  '/campaign-hero.png',
  '[{"key":"items","label":"Items","hue":"#CC8B5C","icon":"gem"},{"key":"npcs","label":"NPCs","hue":"#C97A8E","icon":"person"},{"key":"locations","label":"Locations","hue":"#5FAE9E","icon":"pin"},{"key":"bestiary","label":"Creatures","hue":"#84A65C","icon":"paw"},{"key":"factions","label":"Factions","hue":"#C25B5B","icon":"banner"},{"key":"lore","label":"Lore","hue":"#9B7FC9","icon":"book"},{"key":"quests","label":"Quests","hue":"#5C8FD6","icon":"compass"},{"key":"sessions","label":"Sessions","hue":"#8A93A8","icon":"scroll"}]'::jsonb
) on conflict (id) do nothing;

-- ---------- Lock everything down ----------
-- RLS on with no policies = the public/anon role can do nothing directly.
-- All access goes through the serverless functions using the secret key.
alter table cards    enable row level security;
alter table settings enable row level security;

-- ---------- Sample entries (delete once you start your own) ----------
insert into cards (id, name, category, categories, tags, image, visible, description, stats) values
(
  'seed-emberglass', 'Emberglass Dagger', 'items', '["items"]'::jsonb, '["cursed","fire"]'::jsonb, '', true,
  'A slim blade of blackened glass that holds a single ember at its core. Warm to the touch, it never cools — and never quite stops whispering.',
  '[{"id":"a1","label":"Damage","value":"1d4 + 1 fire","visible":true},{"id":"a2","label":"Properties","value":"Finesse, Light","visible":true},{"id":"a3","label":"Attunement","value":"Required","visible":true},{"id":"a4","label":"True Origin","value":"Forged from a dying star","visible":false},{"id":"a5","label":"Curse","value":"Demands one secret per night","visible":false}]'::jsonb
),
(
  'seed-seraphine', 'Seraphine Vance', 'npcs', '["npcs"]'::jsonb, '["archive","ally"]'::jsonb, '', true,
  'Keeper of the Lower Archive. Quiet, exact, and unfailingly polite. She remembers every face that passes her desk.',
  '[{"id":"b1","label":"Role","value":"Archivist","visible":true},{"id":"b2","label":"Disposition","value":"Wary, helpful","visible":true},{"id":"b3","label":"Hidden Loyalty","value":"Agent of the Ashen Court","visible":false},{"id":"b4","label":"Leverage","value":"Owes a blood-debt to the party","visible":false}]'::jsonb
),
(
  'seed-spire', 'The Drowned Spire', 'locations', '["locations"]'::jsonb, '["dungeon"]'::jsonb, '', true,
  'A tower that sank but refused to fall. At low tide its upper windows breach the water, lit from within by something that should have drowned long ago.',
  '[{"id":"c1","label":"Region","value":"Saltmarsh Reach","visible":true},{"id":"c2","label":"Threat","value":"High","visible":true},{"id":"c3","label":"Vault","value":"Holds the second Codex Key","visible":false}]'::jsonb
),
(
  'seed-stag', 'Hollow Stag', 'bestiary', '["bestiary"]'::jsonb, '["fey"]'::jsonb, '', true,
  'Antlered, eyeless, and silent. It walks the old forest paths as if it still remembers being alive.',
  '[{"id":"d1","label":"Challenge","value":"CR 5","visible":true},{"id":"d2","label":"Speed","value":"50 ft.","visible":true},{"id":"d3","label":"Hit Points","value":"76 (9d10 + 27)","visible":false},{"id":"d4","label":"Weakness","value":"Silvered weapons","visible":false}]'::jsonb
),
(
  'seed-court', 'The Ashen Court', 'factions', '["factions"]'::jsonb, '["villain"]'::jsonb, '', false,
  'They do not advertise. By the time you know the Court is interested in you, the decision has already been made.',
  '[{"id":"e1","label":"Reach","value":"Three kingdoms, unseen","visible":false},{"id":"e2","label":"True Goal","value":"Unmake the Final Seal","visible":false}]'::jsonb
)
on conflict (id) do nothing;
