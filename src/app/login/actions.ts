"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/safe-next";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendSignInLink(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(form.get("next") ?? ""));
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return { status: "error", message: "Enter a valid email address.", email };
  }

  const env = supabaseEnv();
  if (!env) return { status: "error", message: "Sign-in is not configured yet.", email };

  // The SSR client always uses PKCE, where the link only works in the browser that asked for it. People
  // often open the email elsewhere (another browser, their phone), and the default email templates cannot
  // be changed without custom SMTP. The implicit flow puts the session in the link itself, and
  // /auth/complete finishes sign-in wherever the link is opened. Revisit once Resend SMTP is set up.
  const supabase = createSupabaseClient(env.url, env.key, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${await siteUrl()}/auth/complete?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const rateLimited = error.status === 429 || /rate limit/i.test(error.message);
    return {
      status: "error",
      email,
      message: rateLimited
        ? "Too many sign-in emails have been sent. Please try again later; this can take up to an hour."
        : "We could not send the sign-in email. Try again in a moment.",
    };
  }
  return { status: "sent", email };
}
