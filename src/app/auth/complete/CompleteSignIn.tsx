"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

// The sign-in link lands here with the session in the URL fragment (#access_token=…), which only the
// browser can read. We store it as cookies, wipe it from the address bar, then continue.
export function CompleteSignIn() {
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Run once: the fragment is wiped below, so a second run (React dev mode) would see no tokens.
    if (started.current) return;
    started.current = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    window.history.replaceState(null, "", window.location.pathname);

    if (!access_token || !refresh_token) {
      setFailed(true);
      return;
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) setFailed(true);
        // A full navigation so the server renders with the new session cookie.
        else window.location.replace(next);
      });
  }, []);

  if (failed) {
    return (
      <>
        <h1 className="mt-[18px] mb-5 text-[clamp(34px,4.6vw,56px)] leading-[1.05] tracking-[-.02em]">This link did not work.</h1>
        <p className="text-[17px] text-[#555]">It may have expired or already been used. Request a new one.</p>
        <div className="mt-8">
          <Link href="/login" className="btn">
            Back to sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <h1 className="mt-[18px] text-[clamp(34px,4.6vw,56px)] leading-[1.05] tracking-[-.02em]" role="status">
      Signing you in…
    </h1>
  );
}
