import type { Metadata } from "next";
import { StudioShell } from "../StudioShell";
import { WorksManager } from "./WorksManager";
import { requireArtist } from "@/lib/data/guards";
import { getMyWorks, imageUrl } from "@/lib/data/works";

export const metadata: Metadata = { title: "Works · Studio", robots: { index: false } };

export default async function StudioWorksPage() {
  const { artist } = await requireArtist("/studio/works");
  const rows = await getMyWorks(artist.id);
  const works = rows.map((r) => ({ ...r, thumbUrl: imageUrl(r.thumb_path) }));

  return (
    <StudioShell artist={artist} active="works" title="Works">
      <WorksManager artistId={artist.id} artistSlug={artist.slug} initialWorks={works} />
    </StudioShell>
  );
}
