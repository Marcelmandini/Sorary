import { redirect } from "next/navigation";
import { requireArtist } from "@/lib/data/guards";

// Analytics becomes the studio home in phase 6. Until then the studio opens on the profile.
export default async function StudioPage() {
  await requireArtist("/studio");
  redirect("/studio/profile");
}
