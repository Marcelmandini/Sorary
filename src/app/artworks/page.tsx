import type { Metadata } from "next";
import { ArtworkBrowser } from "./ArtworkBrowser";
import { getCatalog } from "@/lib/data/works";
import { filtersFromParams } from "@/lib/filter-works";

export const metadata: Metadata = { title: "Artworks" };

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [works, params] = await Promise.all([getCatalog(), searchParams]);

  return (
    <>
      <div className="pt-[clamp(48px,6vw,96px)] pb-[clamp(24px,3vw,40px)]">
        <span className="eyebrow">Artworks</span>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(36px,5vw,72px)] leading-[1.02] tracking-[-.025em]">Original works</h1>
      </div>
      <ArtworkBrowser works={works} initialFilters={filtersFromParams(params)} />
    </>
  );
}
