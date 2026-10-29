/** Only same-site paths are allowed as post-sign-in destinations, never another host. */
export function safeNext(next: string | null | undefined, fallback = "/studio"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
