import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getCurrentUser } from "@/lib/data/artists";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Request a new one below.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="max-w-[560px] py-[clamp(56px,10vw,140px)]">
      <span className="eyebrow">Sign in</span>
      <h1 className="mt-[18px] mb-5 text-[clamp(34px,4.6vw,56px)] leading-[1.05] tracking-[-.02em]">Welcome to SORARY.</h1>
      <p className="mb-12 text-[17px] text-[#555]">
        Sign in to open your studio, follow artists and save works. We email you a link, so there is no password to
        remember.
      </p>
      {error && ERRORS[error] && (
        <p className="mb-8 border border-line bg-surface px-5 py-4 text-sm text-[#555]" role="alert">
          {ERRORS[error]}
        </p>
      )}
      {isSupabaseConfigured() ? (
        <LoginForm next={next} />
      ) : (
        <p className="border border-line bg-surface px-5 py-4 text-sm text-[#555]">
          Sign-in is not configured yet. Add the Supabase settings to <code className="mono">.env.local</code>.
        </p>
      )}
    </div>
  );
}
