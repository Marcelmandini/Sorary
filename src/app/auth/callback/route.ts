import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

// Handles both kinds of sign-in link Supabase can send:
//  - ?code=…            (default template, PKCE: must be opened in the browser that asked for it)
//  - ?token_hash=…&type= (recommended template: works on any device)
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  if (supabase) {
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("missing code") };
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  const back = new URL("/login", url.origin);
  back.searchParams.set("error", "link");
  if (next !== "/studio") back.searchParams.set("next", next);
  return NextResponse.redirect(back);
}
