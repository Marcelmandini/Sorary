"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Keeps the sign-in session fresh (stands in for the session proxy, see src/lib/supabase/proxy.ts).
// The browser client refreshes the access token before it expires and writes the new session cookie;
// the page is then re-rendered on the server with the fresh cookie. For signed-out visitors it does
// nothing: there is no session cookie to read and no request is made.
export function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // Reading the session refreshes it straight away if the access token has already expired.
    void supabase.auth.getSession();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_OUT") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return null;
}
