import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { FEES, artistReceives, buyerProtection, buyerTotal } from "@/config/fees";
import { SUPPORT_EMAIL } from "@/config/site";
import { getMyArtist } from "@/lib/data/artists";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sell on SORARY",
  description: "Listing is free and SORARY takes no commission. Artists receive the full price of every work they sell.",
};

const EXAMPLES = [3000, 8000, 20000];

export default async function SellPage() {
  const artist = await getMyArtist();
  const pct = Math.round(FEES.buyerProtectionPct * 100);

  return (
    <div className="py-[clamp(56px,9vw,128px)]">
      <span className="eyebrow">Sell on SORARY</span>
      <h1 className="mt-[18px] mb-8 max-w-[14ch] text-[clamp(40px,6vw,84px)] leading-none tracking-[-.02em]">
        Free for artists. Always.
      </h1>
      <p className="max-w-[62ch] text-[17px] text-[#333]">
        Listing is free and SORARY takes no commission. When a work sells, you receive the full price you set. Buyers
        pay a buyer-protection fee on top, which covers secure payment, held funds and refunds if something goes wrong.
      </p>

      <div className="mt-14 grid grid-cols-1 border-t border-fg min-[900px]:grid-cols-3">
        <Plan
          label="Selling"
          price="0"
          unit="kr"
          items={["Unlimited listings", "You keep 100% of the price", `Paid out ${FEES.payoutReleaseDays} days after delivery`, "Studio with analytics"]}
        />
        <Plan
          label="Lift · optional"
          price={String(FEES.liftPriceSek)}
          unit={`kr / ${FEES.liftDays} days`}
          items={["Shown first in Artworks", "Featured on the front page", "Always labelled Sponsored", "Never affects Artist Momentum"]}
        />
        <Plan
          label="Pro · coming later"
          price={String(FEES.proPriceSekPerMonth)}
          unit="kr / month"
          items={["Full analytics history", "Audience by city and source", "Priority support"]}
        />
      </div>

      <h2 className="mt-[72px] mb-[18px] text-[22px] font-normal">What the buyer pays</h2>
      <div className="overflow-x-auto">
        <table className="w-full max-w-[640px] min-w-[480px] border-collapse text-[14.5px]">
          <thead>
            <tr className="lbl text-left">
              <th className="border-b border-fg py-2.5 pr-3.5 font-normal">Artwork price</th>
              <th className="border-b border-fg py-2.5 pr-3.5 text-right font-normal">Buyer protection</th>
              <th className="border-b border-fg py-2.5 pr-3.5 text-right font-normal">Buyer pays</th>
              <th className="border-b border-fg py-2.5 text-right font-normal">Artist receives</th>
            </tr>
          </thead>
          <tbody className="mono">
            {EXAMPLES.map((p) => (
              <tr key={p}>
                <td className="border-b border-line py-3 pr-3.5">{formatPrice(p)}</td>
                <td className="border-b border-line py-3 pr-3.5 text-right">{formatPrice(buyerProtection(p))}</td>
                <td className="border-b border-line py-3 pr-3.5 text-right">{formatPrice(buyerTotal(p))}</td>
                <td className="border-b border-line py-3 text-right">{formatPrice(artistReceives(p))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint mt-3.5">
        Buyer protection is {pct}% of the price plus {FEES.buyerProtectionFixedSek} kr. Shipping is agreed with the
        artist.
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-[22px]">
        <Link href={artist ? "/studio" : "/studio/onboarding"} className="btn">
          {artist ? "Open your studio" : "Start selling"}
        </Link>
        <span className="hint">
          Questions? <CopyEmail email={SUPPORT_EMAIL} />
        </span>
      </div>
    </div>
  );
}

function Plan({ label, price, unit, items }: { label: string; price: string; unit: string; items: string[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-5 border-b border-line py-8 min-[900px]:border-b-0 min-[900px]:px-8 min-[900px]:first:pl-0 min-[900px]:[&+&]:border-l">
      <span className="eyebrow">{label}</span>
      <div className="text-[52px] leading-none font-extralight tracking-[-.02em]">
        <span className="mono font-light">{price}</span>
        <small className="ml-1.5 text-[13px] tracking-normal text-muted">{unit}</small>
      </div>
      <ul className="flex flex-col gap-2 text-[15px] text-[#444]">
        {items.map((it) => (
          <li key={it} className="relative pl-[18px] before:absolute before:top-[.8em] before:left-0 before:h-px before:w-2 before:bg-fg">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
