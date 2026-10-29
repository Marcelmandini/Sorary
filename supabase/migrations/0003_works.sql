-- SORARY phase 3: artworks and image storage.
-- Images are resized to WebP in the artist's browser (which also strips camera metadata such as GPS), then
-- uploaded straight to Storage into a folder named after the artist's user id. The bucket enforces type
-- and size on the server; the works table records each listing.

-- ---------------------------------------------------------------------------
-- Works
-- ---------------------------------------------------------------------------
create table public.works (
  id            uuid primary key default gen_random_uuid(),
  artist_id     uuid not null references public.artists (id) on delete cascade,
  slug          extensions.citext not null,
  title         text not null,
  year          text not null default '',
  category      text not null,
  medium        text not null default '',
  dimensions    text not null default '',
  price         integer,                         -- whole SEK
  availability  text not null default 'available',
  description   text not null default '',
  alt           text not null default '',
  styles        text[] not null default '{}',
  subject       text,
  colours       text[] not null default '{}',     -- detected from the image on upload
  image_path    text not null,
  thumb_path    text not null,
  width         integer not null,
  height        integer not null,
  published     boolean not null default false,   -- new uploads start as drafts
  lift_until    timestamptz,                      -- set only by the server after a paid Lift (phase 7)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,

  unique (artist_id, slug),
  constraint works_slug_format   check (char_length(slug) between 1 and 80 and slug::text ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint works_title_len     check (char_length(btrim(title)) between 1 and 120),
  constraint works_year_len      check (char_length(year) <= 12),
  constraint works_category      check (category in ('Painting', 'Sculpture', 'Photography', 'Works on paper')),
  constraint works_medium_len    check (char_length(medium) <= 120),
  constraint works_dims_len      check (char_length(dimensions) <= 60),
  constraint works_price         check (price is null or price between 1 and 100000000),
  constraint works_availability  check (availability in ('available', 'reserved', 'sold')),
  constraint works_desc_len      check (char_length(description) <= 800),
  constraint works_alt_len       check (char_length(alt) <= 200),
  constraint works_styles        check (styles <@ array['Abstract', 'Figurative', 'Expressive', 'Minimalist']::text[]),
  constraint works_subject       check (subject is null or subject in
    ('Landscape & sea', 'Figures & faces', 'Nature', 'Architecture', 'Form & object', 'Non-figurative')),
  constraint works_colours       check (colours <@ array['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
    'brown', 'black', 'grey', 'white']::text[]),
  constraint works_image_owner   check (split_part(image_path, '/', 1) = artist_id::text
                                    and split_part(thumb_path, '/', 1) = artist_id::text),
  constraint works_size          check (width between 1 and 20000 and height between 1 and 20000),
  -- A published work that is for sale must have a price.
  constraint works_publish_price check (not published or availability <> 'available' or price is not null)
);

create index works_published_idx on public.works (published_at desc) where published;
create index works_artist_idx on public.works (artist_id, created_at desc);

create or replace function public.works_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.artist_id is distinct from old.artist_id or new.created_at is distinct from old.created_at then
      raise exception 'artist_id and created_at are read-only' using errcode = 'check_violation';
    end if;
    new.updated_at := now();
  end if;
  if new.published and (tg_op = 'INSERT' or not old.published) then
    new.published_at := now();
  elsif not new.published then
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger works_before_write
before insert or update on public.works
for each row execute function public.works_before_write();

alter table public.works enable row level security;

-- Public sees published works by listed artists; artists always see their own (drafts included).
create policy "Published works by listed artists are public"
  on public.works for select
  to anon, authenticated
  using (
    (published and exists (select 1 from public.artists a where a.id = artist_id and a.listed))
    or artist_id = (select auth.uid())
  );

create policy "Artists add their own works"
  on public.works for insert
  to authenticated
  with check (artist_id = (select auth.uid()));

create policy "Artists update their own works"
  on public.works for update
  to authenticated
  using (artist_id = (select auth.uid()))
  with check (artist_id = (select auth.uid()));

create policy "Artists delete their own works"
  on public.works for delete
  to authenticated
  using (artist_id = (select auth.uid()));

-- Explicit grants (this project does not expose new tables automatically). lift_until and the
-- timestamps are deliberately not writable through the API.
revoke all on public.works from anon, authenticated;
grant select on public.works to anon, authenticated;
grant delete on public.works to authenticated;
grant insert (artist_id, slug, title, year, category, medium, dimensions, price, availability, description, alt,
              styles, subject, colours, image_path, thumb_path, width, height, published)
  on public.works to authenticated;
grant update (slug, title, year, category, medium, dimensions, price, availability, description, alt,
              styles, subject, colours, published)
  on public.works to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for artwork images (public read, so pages can show them without signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artworks', 'artworks', true, 6291456, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Artists write only inside their own folder: artworks/<user id>/<file>.
create policy "Artists upload artwork images to their folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artworks' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Artists delete their own artwork images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'artworks' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Needed so artists can check and remove their own files; the public reads images through public URLs.
create policy "Artists see their own artwork images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'artworks' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
