import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/**
 * Refreshes the Supabase session cookie on each request so Server Components see a valid session.
 *
 * Not active at the moment: Netlify's CLI cannot bundle a Next.js proxy when deploying from Windows, so
 * <SessionRefresher /> refreshes the session in the browser instead. To turn this back on once Netlify
 * builds from GitHub (Linux), add src/proxy.ts:
 *   export async function proxy(request: NextRequest) { return updateSession(request); }
 *   export const config = { matcher: ["/((?!_next/static|_next/image|art/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = supabaseEnv();
  if (!env) return response;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Do not put code between client creation and this call: it is what refreshes an expired session.
  await supabase.auth.getClaims();
  return response;
}
