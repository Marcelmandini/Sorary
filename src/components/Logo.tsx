import "server-only";
import fs from "node:fs";
import path from "node:path";

// The logo is always brand/logo.svg (custom letterforms). It is read once on the server and inlined
// so it takes the surrounding text colour. The embedded C2PA metadata is dropped to keep pages small.
let cached: string | null = null;

function logoMarkup(): string {
  if (cached) return cached;
  const raw = fs.readFileSync(path.join(process.cwd(), "brand", "logo.svg"), "utf8");
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 939 118";
  const paths = raw.match(/<path\b[^>]*\/>/g) ?? [];
  cached =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false" fill="currentColor" style="display:block;height:100%;width:auto">` +
    paths.join("") +
    `</svg>`;
  return cached;
}

export function Logo({ height = 13, className = "" }: { height?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-fg ${className}`}
      style={{ height }}
      dangerouslySetInnerHTML={{ __html: logoMarkup() }}
    />
  );
}
