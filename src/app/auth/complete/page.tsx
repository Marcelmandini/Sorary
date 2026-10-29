import type { Metadata } from "next";
import { CompleteSignIn } from "./CompleteSignIn";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default function CompletePage() {
  return (
    <div className="max-w-[560px] py-[clamp(72px,12vw,160px)]">
      <span className="eyebrow">Sign in</span>
      <CompleteSignIn />
    </div>
  );
}
