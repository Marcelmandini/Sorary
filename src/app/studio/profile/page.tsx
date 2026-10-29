import type { Metadata } from "next";
import { ProfileForm } from "./ProfileForm";
import { StudioShell } from "../StudioShell";
import { requireArtist } from "@/lib/data/guards";

export const metadata: Metadata = { title: "Profile · Studio", robots: { index: false } };

export default async function StudioProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { artist } = await requireArtist("/studio/profile");
  const { welcome } = await searchParams;

  return (
    <StudioShell artist={artist} active="profile" title="Profile">
      {welcome && (
        <div className="mb-10 flex flex-wrap items-baseline gap-4 border border-fg bg-surface px-5 py-4 text-sm text-[#555]" role="status">
          <b className="font-normal text-fg">Your artist profile is live.</b>
          <span>Add a biography below. Uploading works opens in the next phase.</span>
        </div>
      )}
      <ProfileForm artist={artist} />
    </StudioShell>
  );
}
