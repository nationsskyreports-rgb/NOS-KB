-- ============================================================
--  NOS Knowledge Base — schema + security
--  Standalone: lives in the same Supabase project as the
--  portals, but touches NONE of their tables.
--
--  Security model:
--   • READ  → open to everyone (anon), no login.
--   • WRITE → only through RPC functions that require an
--             edit passphrase. Direct writes with the anon
--             key are denied by RLS, so even someone who
--             bypasses the UI cannot insert/update/delete.
--
--  Safe to re-run (idempotent).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- articles table ----------
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null,
  content     text,                         -- markdown
  icon        text,
  author      text,
  tags        text[],
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- keep updated_at fresh on every update
create or replace function public.kb_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.kb_touch_updated_at();

-- ---------- settings table (holds the edit passphrase hash) ----------
-- Never exposed to the client. No RLS grant to anon = unreadable.
create table if not exists public.kb_settings (
  id            int primary key default 1,
  edit_key_hash text not null,
  constraint kb_settings_single_row check (id = 1)
);

-- Seed / update the edit passphrase.
-- CHANGE 'change-me-please' TO YOUR OWN SECRET before running,
--    or run this line again later with a new value to rotate it.
insert into public.kb_settings (id, edit_key_hash)
values (1, crypt('change-me-please', gen_salt('bf')))
on conflict (id) do update
  set edit_key_hash = excluded.edit_key_hash;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.articles   enable row level security;
alter table public.kb_settings enable row level security;

-- articles: anyone can READ
drop policy if exists "kb public read" on public.articles;
create policy "kb public read"
  on public.articles for select
  using ( true );

-- articles: NO direct write policies on purpose.
-- With RLS on and no insert/update/delete policy, the anon key
-- cannot write directly. Writes go through the RPCs below.

-- kb_settings: no policies at all -> anon can neither read nor write it.

-- ============================================================
--  WRITE RPCs  (SECURITY DEFINER = run with owner rights,
--  bypassing RLS, but only after the passphrase checks out)
-- ============================================================

-- verify a key (used by the UI to unlock the editor)
create or replace function public.kb_verify_key(p_key text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare stored text;
begin
  select edit_key_hash into stored from public.kb_settings where id = 1;
  if stored is null then return false; end if;
  return stored = crypt(p_key, stored);
end;
$$;

-- create
create or replace function public.kb_create_article(
  p_key text, p_title text, p_category text,
  p_content text, p_icon text default null,
  p_author text default null, p_tags text[] default null
) returns public.articles
language plpgsql security definer set search_path = public as $$
declare stored text; row public.articles;
begin
  select edit_key_hash into stored from public.kb_settings where id = 1;
  if stored is null or stored <> crypt(p_key, stored) then
    raise exception 'invalid edit key';
  end if;

  insert into public.articles (title, category, content, icon, author, tags)
  values (p_title, p_category, p_content, p_icon, p_author, p_tags)
  returning * into row;
  return row;
end;
$$;

-- update
create or replace function public.kb_update_article(
  p_key text, p_id uuid, p_title text, p_category text,
  p_content text, p_icon text default null,
  p_author text default null, p_tags text[] default null
) returns public.articles
language plpgsql security definer set search_path = public as $$
declare stored text; row public.articles;
begin
  select edit_key_hash into stored from public.kb_settings where id = 1;
  if stored is null or stored <> crypt(p_key, stored) then
    raise exception 'invalid edit key';
  end if;

  update public.articles set
    title = p_title, category = p_category, content = p_content,
    icon = coalesce(p_icon, icon),
    author = coalesce(p_author, author),
    tags = coalesce(p_tags, tags)
  where id = p_id
  returning * into row;
  return row;
end;
$$;

-- delete
create or replace function public.kb_delete_article(p_key text, p_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare stored text;
begin
  select edit_key_hash into stored from public.kb_settings where id = 1;
  if stored is null or stored <> crypt(p_key, stored) then
    raise exception 'invalid edit key';
  end if;

  delete from public.articles where id = p_id;
  return true;
end;
$$;

-- let the anon (public) role call these functions
grant execute on function public.kb_verify_key(text)                                          to anon, authenticated;
grant execute on function public.kb_create_article(text,text,text,text,text,text,text[])       to anon, authenticated;
grant execute on function public.kb_update_article(text,uuid,text,text,text,text,text,text[])  to anon, authenticated;
grant execute on function public.kb_delete_article(text,uuid)                                  to anon, authenticated;

-- ============================================================
--  SEED — 4 starter articles (edit or replace from the UI later)
-- ============================================================
insert into public.articles (title, category, content, icon, author) values
(
  'RLS policies cheat-sheet',
  'SQL & Database',
  '# RLS policies cheat-sheet

Row Level Security should be **on for every table**. A table with RLS enabled and no policy denies everything — the safe default.

## Enable RLS
```sql
alter table public.clients enable row level security;
```

## Public read policy
```sql
create policy "public read active"
on public.clients for select
using ( status = ''active'' );
```

## Verify
```sql
select policyname, cmd, roles
from pg_policies
where tablename = ''clients'';
```',
  '🗄️', 'Kareem'
),
(
  'Bulk client import script',
  'Scripts',
  '# Bulk client import script

Insert rows into Supabase in batches, skipping duplicates by phone.

```js
async function bulkImport(rows) {
  const batchSize = 500;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(''clients'')
      .upsert(batch, { onConflict: ''phone'' });
    if (error) console.error(''batch failed'', error);
  }
}
```

> Tip: upsert with onConflict phone avoids duplicate clients.',
  '📤', 'Kareem'
),
(
  'Deploy to GitHub Pages',
  'Guides',
  '# Deploy to GitHub Pages

1. Build the static output.
2. Push it to the gh-pages branch.
3. In the repo: Settings -> Pages -> Source = gh-pages.

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

> Test on GitHub Pages first, then deploy to Cloudflare Pages for production.',
  '🚀', 'Kareem'
),
(
  'Supabase environment variables',
  'Config',
  '# Supabase environment variables

Two values, found in Dashboard -> Settings -> API:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

- anon key -> safe for the frontend. RLS protects the data.
- Never put the service_role key in frontend code — it bypasses all security.',
  '⚙️', 'Kareem'
)
on conflict do nothing;

-- ---------- verification ----------
select policyname, cmd from pg_policies where tablename = 'articles';
select id, title, category from public.articles order by created_at;
