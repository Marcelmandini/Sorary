import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { ProsePage } from "@/components/ProsePage";
import { SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: "SORARY is a marketplace for original contemporary art, founded in Stockholm.",
};

export default function AboutPage() {
  return (
    <ProsePage eyebrow="About" title="A marketplace for original contemporary art.">
      <p>
        SORARY brings collectors and artists together around original work. Every piece is listed by the artist who made
        it, and artists keep the full price of everything they sell. Collectors buy with buyer protection, directly from
        the studio.
      </p>
      <p>
        Artist Momentum shows where attention is moving on SORARY, calculated only from genuine activity, so collectors
        can find artists early and artists can see what their work is doing in the world. It measures attention, not
        value.
      </p>
      <p>SORARY was founded in Stockholm and is open to artists everywhere.</p>

      <h2>For artists</h2>
      <p>
        Listing is free, with no commission. <Link href="/sell">See how selling works</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions from collectors, artists or press: <CopyEmail email={SUPPORT_EMAIL} />
      </p>
    </ProsePage>
  );
}
