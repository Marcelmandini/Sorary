// Public Supabase settings. The publishable (anon) key is safe in the browser: every table is protected
// by Row Level Security. Secret keys never use the NEXT_PUBLIC_ prefix.

export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export const isSupabaseConfigured = () => supabaseEnv() !== null;
