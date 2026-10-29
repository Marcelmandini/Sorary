-- Permission tests for public.artists and public.admins.
-- Paste into Supabase → SQL Editor and run. Everything happens in one transaction that is rolled back,
-- so no data is left behind. Success prints "All artist permission tests passed"; any failure aborts
-- with a message naming the broken rule.

begin;

-- Two throwaway users, A and B.
insert into auth.users (id, email, aud, role)
values ('00000000-0000-4000-8000-00000000000a', 'rls-a@example.test', 'authenticated', 'authenticated'),
       ('00000000-0000-4000-8000-00000000000b', 'rls-b@example.test', 'authenticated', 'authenticated');

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
  a uuid := '00000000-0000-4000-8000-00000000000a';
  b uuid := '00000000-0000-4000-8000-00000000000b';
  n int;
  failed boolean;
begin
  -- A creates a listed profile, B creates an unlisted one.
  perform pg_temp.act_as(a);
  insert into public.artists (id, slug, name, medium) values (a, 'rls-artist-a', 'Artist A', 'Painting');
  perform pg_temp.act_as(b);
  insert into public.artists (id, slug, name, medium, listed) values (b, 'rls-artist-b', 'Artist B', 'Sculpture', false);

  -- A user cannot create a profile for someone else.
  perform pg_temp.act_as(a);
  failed := false;
  begin
    insert into public.artists (id, slug, name, medium) values (b, 'rls-artist-c', 'Fake', 'Painting');
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'a user created a profile with someone else''s id');

  -- Anonymous visitors see listed profiles only, and cannot write.
  perform pg_temp.act_as(null);
  select count(*) into n from public.artists where slug in ('rls-artist-a', 'rls-artist-b');
  perform pg_temp.expect(n = 1, 'anon should see exactly the listed profile');
  failed := false;
  begin
    insert into public.artists (id, slug, name, medium) values (a, 'rls-anon', 'Anon', 'Painting');
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'anon inserted an artist');
  -- anon has no UPDATE privilege at all, so this raises; the check below confirms nothing changed.
  begin
    update public.artists set name = 'Hacked' where id = a;
  exception when insufficient_privilege then null;
  end;
  perform pg_temp.act_as(a);
  select count(*) into n from public.artists where id = a and name = 'Artist A';
  perform pg_temp.expect(n = 1, 'anon changed a profile');

  -- B sees their own unlisted profile; A does not.
  perform pg_temp.act_as(b);
  select count(*) into n from public.artists where id = b;
  perform pg_temp.expect(n = 1, 'owner cannot see their own unlisted profile');
  perform pg_temp.act_as(a);
  select count(*) into n from public.artists where id = b;
  perform pg_temp.expect(n = 0, 'another user can see an unlisted profile');

  -- A cannot change or delete B's profile (B made listed first, so the row is visible to A).
  perform pg_temp.act_as(b);
  update public.artists set listed = true where id = b;
  perform pg_temp.act_as(a);
  update public.artists set name = 'Hacked' where id = b;
  delete from public.artists where id = b;
  perform pg_temp.act_as(b);
  select count(*) into n from public.artists where id = b and name = 'Artist B';
  perform pg_temp.expect(n = 1, 'one artist changed or deleted another artist''s profile');

  -- Owners can edit their profile, but not the address.
  perform pg_temp.act_as(a);
  update public.artists set statement = 'New statement' where id = a;
  select count(*) into n from public.artists where id = a and statement = 'New statement';
  perform pg_temp.expect(n = 1, 'owner could not update their own profile');
  failed := false;
  begin
    update public.artists set slug = 'rls-renamed' where id = a;
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'the profile address could be changed');

  -- Database rules reject bad data even if the form is bypassed.
  perform pg_temp.act_as(a);
  failed := false;
  begin
    update public.artists set medium = 'Video' where id = a;
  exception when others then failed := true;
  end;
  perform pg_temp.expect(failed, 'an unknown medium was accepted');

  -- Slug availability sees unlisted profiles and reserved words.
  perform pg_temp.act_as(null);
  perform pg_temp.expect(not public.slug_available('rls-artist-b'), 'slug_available missed a taken address');
  perform pg_temp.expect(not public.slug_available('studio'), 'slug_available allowed a reserved address');
  perform pg_temp.expect(public.slug_available('rls-free-address'), 'slug_available rejected a free address');

  -- The admins table is invisible through the API, and is_admin() is false for ordinary users.
  perform pg_temp.act_as(a);
  failed := false;
  begin
    select count(*) into n from public.admins;
  exception when insufficient_privilege then failed := true;
  end;
  perform pg_temp.expect(failed, 'an ordinary user could read the admins table');
  perform pg_temp.expect(not public.is_admin(), 'is_admin() was true for an ordinary user');

  perform set_config('role', 'postgres', true);
  raise notice 'All artist permission tests passed';
end $$;

rollback;

-- Only reached when every check above passed.
select 'All artist permission tests passed' as result;
