import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static files and images; everything else gets a fresh session.
  matcher: ["/((?!_next/static|_next/image|art/|favicon.png|apple-touch-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
