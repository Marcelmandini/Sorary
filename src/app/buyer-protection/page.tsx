import type { Metadata } from "next";
import { CopyEmail } from "@/components/CopyEmail";
import { ProsePage } from "@/components/ProsePage";
import { FEES, buyerProtection, buyerTotal } from "@/config/fees";
import { SUPPORT_EMAIL } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Buyer protection",
  description: "Every purchase through SORARY is protected: payment is held until the work is delivered as described.",
};

export default function BuyerProtectionPage() {
  const pct = Math.round(FEES.buyerProtectionPct * 100);
  const example = 12000;
  return (
    <ProsePage eyebrow="Buyer protection" title="Buy original art with confidence." note="Card payments open soon">
      <p>
        Every purchase made through SORARY&apos;s checkout is protected. Buyer protection costs {pct}% of the artwork price
        plus {FEES.buyerProtectionFixedSek} kr, and is always shown before you pay. For a work priced at{" "}
        <span className="mono">{formatPrice(example)}</span>, buyer protection is{" "}
        <span className="mono">{formatPrice(buyerProtection(example))}</span> and you pay{" "}
        <span className="mono">{formatPrice(buyerTotal(example))}</span> plus shipping. The artist receives the full price.
      </p>

      <h2>How it works</h2>
      <p>
        You pay SORARY, not the artist directly. We hold the payment while the work is packed and shipped. Once it is
        delivered you have {FEES.payoutReleaseDays} days to report a problem. If you don&apos;t, the payment is released to
        the artist.
      </p>

      <h2>What is covered</h2>
      <p>A full refund if the work never arrives, arrives damaged, or is significantly different from its description and photos.</p>

      <h2>What is not covered</h2>
      <p>
        Purchases arranged outside SORARY, for example paid by direct bank transfer to the artist, and changes of mind
        about a work that matches its listing.
      </p>

      <h2>Report a problem</h2>
      <p>
        Write to <CopyEmail email={SUPPORT_EMAIL} /> within {FEES.payoutReleaseDays} days of delivery, with your order
        details and photos of the work.
      </p>
    </ProsePage>
  );
}
