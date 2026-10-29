import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";
import { getMyArtist } from "@/lib/data/artists";
import { requireUser } from "@/lib/data/guards";

export const metadata: Metadata = { title: "Join as an artist", robots: { index: false } };

export default async function OnboardingPage() {
  await requireUser("/studio/onboarding");
  if (await getMyArtist()) redirect("/studio/profile");

  return (
    <div className="mx-auto max-w-[760px] pt-[clamp(48px,8vw,96px)]">
      <span className="eyebrow">For artists</span>
      <h1 className="mt-[18px] mb-4 text-[clamp(34px,4.6vw,58px)] leading-[1.04] tracking-[-.02em]">
        Join SORARY as an artist.
      </h1>
      <p className="mb-12 max-w-[52ch] text-[17px] text-[#555]">
        List original work, build a following and see how collectors engage with it. Listing is free and you keep the
        full price of every sale.
      </p>
      <OnboardingForm />
    </div>
  );
}
