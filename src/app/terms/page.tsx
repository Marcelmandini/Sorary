import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/ProsePage";
import { FEES } from "@/config/fees";
import { LEGAL, SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for artists and collectors using SORARY.",
};

export default function TermsPage() {
  const pct = Math.round(FEES.buyerProtectionPct * 100);
  return (
    <ProsePage eyebrow="Legal" title="Terms of Service" note={`Draft · last updated ${LEGAL.lastUpdated} · to be reviewed before launch`}>
      <p>
        These terms apply when you use SORARY, a marketplace for original contemporary art run by {LEGAL.operator},{" "}
        {LEGAL.location}. By creating an account you accept them.
      </p>

      <h2>1. Your account</h2>
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>Keep the email address you sign in with secure: anyone with access to it can sign in as you.</li>
        <li>Give accurate information, and keep one artist profile per artist.</li>
      </ul>

      <h2>2. Listing as an artist</h2>
      <ul>
        <li>
          List only <b>original works that you made yourself</b> and have the right to sell. No prints, reproductions or
          works by others.
        </li>
        <li>Describe each work accurately, with photos that show it as it is.</li>
        <li>
          Listing is free and SORARY takes <b>no commission</b>: you receive the full price you set. Optional paid
          features, such as Lift ({FEES.liftPriceSek} kr for {FEES.liftDays} days), always show their price before you
          pay. Lift placements are labelled Sponsored and never affect Artist Momentum.
        </li>
      </ul>

      <h2>3. Rights to your work</h2>
      <p>
        You keep all rights to your works and images. You give SORARY a non-exclusive, free licence to show your images
        and listing details on SORARY and in SORARY&apos;s own promotion of your work, for as long as they are listed. When
        you remove a listing we stop showing it, apart from copies in backups that are deleted over time.
      </p>

      <h2>4. What is not allowed</h2>
      <ul>
        <li>Content that is illegal, infringes someone else&apos;s rights, or is hateful, harassing or misleading.</li>
        <li>Arranging sales of works found on SORARY outside SORARY to avoid buyer protection.</li>
        <li>Interfering with the platform, scraping it, or creating accounts in someone else&apos;s name.</li>
      </ul>
      <p>We may remove content or suspend accounts that break these terms, and will tell you why.</p>

      <h2>5. Buying</h2>
      <p>
        Purchases through SORARY open soon. When they do, the buyer pays the artwork price plus buyer protection of{" "}
        {pct}% of the price + {FEES.buyerProtectionFixedSek} kr, shown before payment, and shipping as agreed with the
        artist. Payment is held by SORARY and released to the artist {FEES.payoutReleaseDays} days after delivery, unless
        the buyer reports a problem. See <Link href="/buyer-protection">Buyer protection</Link>. These terms will be
        completed with the full purchase conditions, including consumer rights, before purchases open.
      </p>

      <h2>6. Artist Momentum</h2>
      <p>
        Artist Momentum shows attention on SORARY, calculated only from genuine activity. It is not a valuation of an
        artist or a work, and not investment advice.
      </p>

      <h2>7. Responsibility</h2>
      <p>
        SORARY provides the marketplace. Artists are responsible for their listings and the works they sell. We work to
        keep SORARY available and secure, but cannot promise it will always be free of interruptions. Nothing in these
        terms limits rights you have as a consumer under Swedish or EU law.
      </p>

      <h2>8. Changes, law and contact</h2>
      <p>
        We may update these terms and will notify registered users of significant changes in advance. Swedish law
        applies. Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </ProsePage>
  );
}
