-- SORARY phase 2: artist profiles and admins.
-- Run once in Supabase → SQL Editor (or `supabase db push`). Safe to read top to bottom:
-- every table has Row Level Security switched on before any policy is added.

create extension if not exists citext with schema extensions;

-- ---------------------------------------------------------------------------
-- Reserved profile addresses (mirrors RESERVED_SLUGS in src/lib/artist-profile.ts)
-- ---------------------------------------------------------------------------
create or replace function public.is_reserved_slug(s text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(s) = any (array[
    'about','admin','api','app','art','artists','artworks','assets','auth','blog','buyer-protection','checkout',
    'contact','cookies','dashboard','demo','downloads','following','help','home','legal','login','logout',
    'momentum','new','onboarding','orders','preview','pricing','privacy','profile','sell','settings','signup',
    'sorary','static','studio','support','terms','www'
  ]);
$$;

-- ---------------------------------------------------------------------------
-- Artists: one profile per auth user
-- ---------------------------------------------------------------------------
create table public.artists (
  id          uuid primary key references auth.users (id) on delete cascade,
  slug        extensions.citext not null unique,
  name        text not null,
  city        text not null default '',
  country     text not null default '',
  medium      text not null,
  born        smallint,
  statement   text not null default '',
  bio         text not null default '',
  website     text not null default '',
  instagram   text not null default '',
  listed      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint artists_slug_format check (
    char_length(slug) between 3 and 40
    and slug::text ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and not public.is_reserved_slug(slug::text)
  ),
  constraint artists_name_len      check (char_length(btrim(name)) between 1 and 80),
  constraint artists_city_len      check (char_length(city) <= 60),
  constraint artists_country_len   check (char_length(country) <= 60),
  constraint artists_medium        check (medium in ('Painting', 'Sculpture', 'Photography', 'Works on paper')),
  -- Upper bound is loose on purpose (check constraints must not depend on the clock); the app checks the current year.
  constraint artists_born          check (born is null or born between 1900 and 2100),
  constraint artists_statement_len check (char_length(statement) <= 180),
  constraint artists_bio_len       check (char_length(bio) <= 3000),
  constraint artists_website       check (website = '' or (char_length(website) <= 200 and website ~* '^https?://')),
  constraint artists_instagram     check (instagram ~ '^[A-Za-z0-9._]{0,30}$')
);

comment on table public.artists is 'Public artist profiles. Readable by anyone when listed; editable only by the owner.';

create index artists_listed_created_idx on public.artists (created_at desc) where listed;

-- Keep updated_at current and the profile address fixed once chosen.
create or replace function public.artists_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slug is distinct from old.slug then
    raise exception 'The profile address cannot be changed' using errcode = 'check_violation';
  end if;
  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
    raise exception 'id and created_at are read-only' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger artists_before_update
before update on public.artists
for each row execute function public.artists_before_update();

alter table public.artists enable row level security;

-- Public (including signed-out visitors) can read listed artists; owners can always read their own.
create policy "Listed artists are public"
  on public.artists for select
  to anon, authenticated
  using (listed or id = (select auth.uid()));

create policy "Users create their own artist profile"
  on public.artists for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Artists update their own profile"
  on public.artists for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Artists delete their own profile"
  on public.artists for delete
  to authenticated
  using (id = (select auth.uid()));

-- Column-level grants: nobody writes id-like or timestamp columns directly.
revoke insert, update, delete, truncate on public.artists from anon;
revoke insert, update, truncate on public.artists from authenticated;
grant insert (id, slug, name, city, country, medium, born, statement, bio, website, instagram, listed)
  on public.artists to authenticated;
grant update (name, city, country, medium, born, statement, bio, website, instagram, listed)
  on public.artists to authenticated;

-- Is a profile address free? Sees unlisted profiles too, but reveals only true/false.
create or replace function public.slug_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select char_length(candidate) between 3 and 40
     and candidate ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     and not public.is_reserved_slug(candidate)
     and not exists (select 1 from public.artists a where a.slug = candidate::extensions.citext);
$$;

revoke execute on function public.slug_available(text) from public;
grant execute on function public.slug_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admins: checked server-side only. No policies, so the public API cannot read or change it.
-- Add an admin in the SQL Editor:  insert into public.admins (user_id) values ('<auth user id>');
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Lets the signed-in user ask "am I an admin?" without exposing the table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
