import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, getMyArtist } from "./artists";

/** For studio pages: signed-in user or a redirect to sign in, returning here afterwards. */
export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** For studio pages that need a finished artist profile. */
export async function requireArtist(returnTo: string) {
  const user = await requireUser(returnTo);
  const artist = await getMyArtist();
  if (!artist) redirect("/studio/onboarding");
  return { user, artist };
}
