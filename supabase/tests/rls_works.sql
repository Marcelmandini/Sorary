-- Permission tests for public.works and the artworks storage bucket.
-- Run in Supabase → SQL Editor. One transaction, rolled back: no data is left behind.

begin;

insert into auth.users (id, email, aud, role)
values ('00000000-0000-4000-8000-0000000000aa', 'rls-wa@example.test', 'authenticated', 'authenticated'),
       ('00000000-0000-4000-8000-0000000000bb', 'rls-wb@example.test', 'authenticated', 'authenticated');
insert into public.artists (id, slug, name, medium)
values ('00000000-0000-4000-8000-0000000000aa', 'rls-works-a', 'Artist A', 'Painting'),
       ('00000000-0000-4000-8000-0000000000bb', 'rls-works-b', 'Artist B', 'Painting');

create or replace function pg_temp.act_as(uid uuid) returns void language plpgsql as $$
begin
  if uid is null then
    perform set_config('role', 'anon', true);
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  else
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  end if;
end $$;

create or replace function pg_temp.expect(ok boolean, msg text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', msg; end if;
end $$;

do $$
declare
  a uuid := '00000000-0000-4000-8000-0000000000aa';
  b uuid := '00000000-0000-4000-8000-0000000000bb';
  wa uuid;
  n int;
  failed boolean;
begin
  -- A adds a draft in their own folder.
  perform pg_temp.act_as(a);
  insert into public.works (artist_id, slug, title, category, image_path, thumb_path, width, height)
  values (a, 'draft-one', 'Draft one', 'Painting', a || '/x-full.webp', a || '/x-thumb.webp', 100, 120)
  returning id into wa;

  -- Images must live in the artist's own folder.
  failed := false;
  begin
    insert into public.works (artist_id, slug, title, category, image_path, thumb_path, width, height)
    values (a, 'stolen', 'Stolen', 'Painting', b || '/y-full.webp', b || '/y-thumb.webp', 100, 120);
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'a work pointed at another artist''s images');

  -- Nobody can add a work for someone else.
  failed := false;
  begin
    insert into public.works (artist_id, slug, title, category, image_path, thumb_path, width, height)
    values (b, 'fake', 'Fake', 'Painting', b || '/z-full.webp', b || '/z-thumb.webp', 100, 120);
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'a user added a work for another artist');

  -- Drafts are private.
  perform pg_temp.act_as(null);
  select count(*) into n from public.works where id = wa;
  perform pg_temp.expect(n = 0, 'anon can see a draft');
  perform pg_temp.act_as(b);
  select count(*) into n from public.works where id = wa;
  perform pg_temp.expect(n = 0, 'another artist can see a draft');

  -- Publishing for sale needs a price.
  perform pg_temp.act_as(a);
  failed := false;
  begin
    update public.works set published = true where id = wa;
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'a work for sale was published without a price');
  update public.works set published = true, price = 12000 where id = wa;
  select count(*) into n from public.works where id = wa and published_at is not null;
  perform pg_temp.expect(n = 1, 'published_at was not set');

  -- Published works by listed artists are public; hiding the artist hides the work.
  perform pg_temp.act_as(null);
  select count(*) into n from public.works where id = wa;
  perform pg_temp.expect(n = 1, 'anon cannot see a published work');
  perform pg_temp.act_as(a);
  update public.artists set listed = false where id = a;
  perform pg_temp.act_as(null);
  select count(*) into n from public.works where id = wa;
  perform pg_temp.expect(n = 0, 'a hidden artist''s work is still public');
  perform pg_temp.act_as(a);
  update public.artists set listed = true where id = a;

  -- Another artist cannot change or delete it.
  perform pg_temp.act_as(b);
  update public.works set price = 1 where id = wa;
  delete from public.works where id = wa;
  perform pg_temp.act_as(a);
  select count(*) into n from public.works where id = wa and price = 12000;
  perform pg_temp.expect(n = 1, 'another artist changed or deleted a work');

  -- Artists cannot give themselves a Lift.
  failed := false;
  begin
    update public.works set lift_until = now() + interval '7 days' where id = wa;
  exception when insufficient_privilege then failed := true;
  end;
  perform pg_temp.expect(failed, 'an artist set lift_until');

  -- Anonymous visitors cannot write at all.
  perform pg_temp.act_as(null);
  failed := false;
  begin
    delete from public.works where id = wa;
  exception when insufficient_privilege then failed := true;
  end;
  perform pg_temp.expect(failed, 'anon could delete works');

  -- Storage: own folder only.
  perform pg_temp.act_as(a);
  insert into storage.objects (bucket_id, name, owner_id) values ('artworks', a || '/test-full.webp', a::text);
  failed := false;
  begin
    insert into storage.objects (bucket_id, name, owner_id) values ('artworks', b || '/test-full.webp', a::text);
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'an artist uploaded into another artist''s folder');
  perform pg_temp.act_as(null);
  failed := false;
  begin
    insert into storage.objects (bucket_id, name) values ('artworks', a || '/anon.webp');
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'anon uploaded an image');

  perform set_config('role', 'postgres', true);
end $$;

rollback;

select 'All works permission tests passed' as result;
