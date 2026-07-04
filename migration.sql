-- =============================================================
--  Upgrade an existing Unwritten Codex database.
--  Run once in Supabase > SQL Editor > New query. Safe to re-run.
-- =============================================================

-- Keeper-managed category list + campaign art live on the settings row.
alter table settings add column if not exists categories jsonb;
alter table settings add column if not exists hero_image  text;

update settings
  set categories = '[{"key":"items","label":"Items","hue":"#CC8B5C","icon":"gem"},{"key":"npcs","label":"NPCs","hue":"#C97A8E","icon":"person"},{"key":"locations","label":"Locations","hue":"#5FAE9E","icon":"pin"},{"key":"bestiary","label":"Creatures","hue":"#84A65C","icon":"paw"},{"key":"factions","label":"Factions","hue":"#C25B5B","icon":"banner"},{"key":"lore","label":"Lore","hue":"#9B7FC9","icon":"book"},{"key":"quests","label":"Quests","hue":"#5C8FD6","icon":"compass"},{"key":"sessions","label":"Sessions","hue":"#8A93A8","icon":"scroll"}]'::jsonb
  where categories is null;

update settings set hero_image = '/campaign-hero.png' where hero_image is null;

-- Cards gain multiple categories, tags, and image display settings.
alter table cards add column if not exists categories jsonb not null default '[]'::jsonb;
alter table cards add column if not exists tags       jsonb not null default '[]'::jsonb;
alter table cards add column if not exists image_fit  text  not null default 'cover';
alter table cards add column if not exists image_pos  text  not null default '50% 50%';

-- Move each card's single category into the new array (only where not done yet).
update cards
  set categories = jsonb_build_array(category)
  where (categories is null or categories = '[]'::jsonb) and category is not null;
