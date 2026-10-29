import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[560px] py-[clamp(72px,12vw,160px)]">
      <span className="eyebrow">SORARY</span>
      <h1 className="mt-[18px] mb-5 text-[clamp(34px,4.6vw,56px)] leading-[1.05] tracking-[-.02em]">Nothing here yet.</h1>
      <p className="text-[17px] text-[#555]">This page does not exist, or it has not been built yet.</p>
      <div className="mt-8">
        <Link href="/artworks" className="btn btn-outline">
          Explore artworks
        </Link>
      </div>
    </div>
  );
}
