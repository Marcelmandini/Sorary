import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/** Supabase client for Server Components, Server Actions and Route Handlers. Null when not configured. */
export async function createClient() {
  // Read cookies first, even when unconfigured, so pages that depend on the session always render per request.
  const cookieStore = await cookies();
  const env = supabaseEnv();
  if (!env) return null;
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}
