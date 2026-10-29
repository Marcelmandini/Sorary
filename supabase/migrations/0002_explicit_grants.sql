-- Explicit API grants. Newer Supabase projects can be set to not expose new tables automatically, in which
-- case anon/authenticated get no default privileges and the Data API cannot see the tables at all.
-- Row Level Security still decides which rows each role may read or change.

grant usage on schema public to anon, authenticated;

grant select on public.artists to anon, authenticated;
grant delete on public.artists to authenticated;
grant insert (id, slug, name, city, country, medium, born, statement, bio, website, instagram, listed)
  on public.artists to authenticated;
grant update (name, city, country, medium, born, statement, bio, website, instagram, listed)
  on public.artists to authenticated;

grant execute on function public.slug_available(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Ask the Data API to reload its view of the database.
notify pgrst, 'reload schema';
