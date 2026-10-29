"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDraftWork } from "./actions";
import { WorkEditor } from "./WorkEditor";
import type { WorkRow } from "@/lib/data/works";
import { formatPrice } from "@/lib/format";
import { prepareImage } from "@/lib/prepare-image";
import { createClient } from "@/lib/supabase/client";

export type StudioWork = WorkRow & { thumbUrl: string };

type UploadRow = { id: string; name: string; state: "preparing" | "uploading" | "done" | "error"; message?: string };

export function WorksManager({
  artistId,
  artistSlug,
  initialWorks,
}: {
  artistId: string;
  artistSlug: string;
  initialWorks: StudioWork[];
}) {
  const [works, setWorks] = useState(initialWorks);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setUpload = (id: string, patch: Partial<UploadRow>) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const run = useCallback(
    async (files: FileList | File[]) => {
      const supabase = createClient();
      let firstNew: string | null = null;
      for (const file of Array.from(files)) {
        const rowId = crypto.randomUUID();
        setUploads((list) => [...list, { id: rowId, name: file.name, state: "preparing" }]);
        try {
          const img = await prepareImage(file);
          setUpload(rowId, { state: "uploading" });
          const key = crypto.randomUUID();
          const imagePath = `${artistId}/${key}-full.${img.ext}`;
          const thumbPath = `${artistId}/${key}-thumb.${img.ext}`;
          const opts = { contentType: img.full.type, cacheControl: "31536000", upsert: false };
          const a = await supabase.storage.from("artworks").upload(imagePath, img.full, opts);
          if (a.error) throw new Error("Upload failed. Check your connection and try again.");
          const b = await supabase.storage.from("artworks").upload(thumbPath, img.thumb, { ...opts, contentType: img.thumb.type });
          if (b.error) {
            await supabase.storage.from("artworks").remove([imagePath]);
            throw new Error("Upload failed. Check your connection and try again.");
          }
          const res = await createDraftWork({
            imagePath,
            thumbPath,
            width: img.width,
            height: img.height,
            colours: img.colours,
            filename: file.name,
          });
          if (!res.ok) {
            await supabase.storage.from("artworks").remove([imagePath, thumbPath]);
            throw new Error(res.message);
          }
          const thumbUrl = supabase.storage.from("artworks").getPublicUrl(thumbPath).data.publicUrl;
          setWorks((list) => [{ ...res.work, thumbUrl }, ...list]);
          firstNew ??= res.work.id;
          setUpload(rowId, { state: "done" });
          setTimeout(() => setUploads((list) => list.filter((u) => u.id !== rowId)), 1800);
        } catch (e) {
          setUpload(rowId, { state: "error", message: e instanceof Error ? e.message : "Upload failed." });
        }
      }
      if (firstNew) setEditing(firstNew);
    },
    [artistId],
  );

  const editingWork = works.find((w) => w.id === editing) ?? null;

  return (
    <>
      <label
        className={`flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-3 border px-6 py-10 text-center transition-colors ${
          over ? "border-fg bg-hover" : "border-line bg-surface"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          run(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) run(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="text-[22px]">Add works</span>
        <span className="hint">
          Drop images here or <span className="border-b border-current">choose files</span> · JPG, PNG or WebP, up to 25 MB each
        </span>
      </label>

      {uploads.length > 0 && (
        <ul className="mt-4 flex flex-col" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className="flex justify-between gap-3 border-b border-line py-2 text-[13px]">
              <span className="min-w-0 truncate">{u.name}</span>
              <span className={u.state === "error" ? "field-error" : "text-muted"}>
                {u.state === "preparing" ? "Preparing…" : u.state === "uploading" ? "Uploading…" : u.state === "done" ? "Added as draft" : u.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        {works.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 border border-line px-6 py-[clamp(32px,6vw,72px)] text-center text-[#555]">
            <h3 className="text-2xl text-fg">No works yet</h3>
            <p>Add images above. Each becomes a draft you can describe, price and publish.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-[22px] gap-y-7 min-[640px]:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {works.map((w) => (
              <li key={w.id} className="flex min-w-0 flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(w.id)}
                  className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface p-3"
                  aria-label={`Edit ${w.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.thumbUrl} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                </button>
                <div className="flex justify-between gap-2 text-[13.5px] leading-snug">
                  <span className="truncate">{w.title}</span>
                  <span className="mono shrink-0 text-muted">
                    {w.availability === "sold" ? "Sold" : w.price ? formatPrice(w.price) : "No price"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <StatusPill work={w} />
                  <button type="button" className="textbtn text-xs" onClick={() => setEditing(w.id)}>
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {works.some((w) => w.published) && (
        <p className="hint mt-10">
          Published works appear in{" "}
          <Link href="/artworks" className="border-b border-line hover:border-fg">
            Artworks
          </Link>{" "}
          and on{" "}
          <Link href={`/artists/${artistSlug}`} className="border-b border-line hover:border-fg">
            your public profile
          </Link>
          .
        </p>
      )}

      {editingWork && (
        <WorkEditor
          key={editingWork.id}
          work={editingWork}
          artistSlug={artistSlug}
          onClose={() => setEditing(null)}
          onSaved={(row) => setWorks((list) => list.map((w) => (w.id === row.id ? { ...w, ...row } : w)))}
          onDeleted={(id) => {
            setWorks((list) => list.filter((w) => w.id !== id));
            setEditing(null);
          }}
        />
      )}
      <EscapeToClose active={!!editingWork} onClose={() => setEditing(null)} />
    </>
  );
}

function StatusPill({ work }: { work: WorkRow }) {
  const [label, dot] = work.published ? ["Published", "bg-up"] : ["Draft", "bg-[#c2a14a]"];
  return (
    <span className="inline-flex items-center gap-[7px] border border-line px-2.5 py-1 text-[10.5px] font-normal tracking-[.16em] whitespace-nowrap uppercase">
      <i className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function EscapeToClose({ active, onClose }: { active: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);
  return null;
}
