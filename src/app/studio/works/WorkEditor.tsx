"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { deleteWork, updateWork, type WorkFormState } from "./actions";
import type { StudioWork } from "./WorksManager";
import { described, Field } from "../Field";
import { artistReceives, buyerTotal } from "@/config/fees";
import type { WorkRow } from "@/lib/data/works";
import { formatPrice } from "@/lib/format";
import { AVAILABILITY, COLOURS, MEDIUMS, STYLES, SUBJECTS } from "@/lib/taxonomy";
import { parsePrice, WORK_LIMITS } from "@/lib/work-form";

export function WorkEditor({
  work,
  artistSlug,
  onClose,
  onSaved,
  onDeleted,
}: {
  work: StudioWork;
  artistSlug: string;
  onClose: () => void;
  onSaved: (row: WorkRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [state, action, pending] = useActionState<WorkFormState, FormData>(updateWork.bind(null, work.id), { status: "idle" });
  const e = state.errors ?? {};
  const current = state.work ?? work;
  const [priceText, setPriceText] = useState(work.price ? String(work.price) : "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => firstField.current?.focus(), []);
  // Report each successful save once (onSaved is a new function on every parent render).
  const reported = useRef<WorkFormState | null>(null);
  useEffect(() => {
    if (state.status === "saved" && state.work && reported.current !== state) {
      reported.current = state;
      onSaved(state.work);
    }
  }, [state, onSaved]);

  const price = parsePrice(priceText);
  const priceHint =
    price && !Number.isNaN(price)
      ? `You receive ${formatPrice(artistReceives(price))}. Buyer pays ${formatPrice(buyerTotal(price))} including buyer protection.`
      : "You keep the full price. Buyers pay buyer protection on top.";
  const colourLabels = current.colours.map((k) => COLOURS.find((c) => c.key === k)?.label).filter(Boolean);

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-white/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${work.title}`}
        className="fixed inset-y-0 right-0 z-[120] w-full max-w-[520px] animate-fade overflow-y-auto border-l border-line bg-bg px-[max(20px,env(safe-area-inset-right,0px))] pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-[calc(env(safe-area-inset-bottom,0px)+40px)] min-[560px]:px-7"
      >
        <div className="mb-7 flex items-center justify-between">
          <span className="eyebrow">Edit listing</span>
          <button type="button" className="text-[11px] tracking-[.22em] text-muted uppercase hover:text-fg" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mb-7 flex max-h-[260px] justify-center bg-surface p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={work.thumbUrl} alt="" className="max-h-[220px] w-auto object-contain" />
        </div>

        <form action={action} noValidate className="grid grid-cols-2 gap-x-6 gap-y-6">
          <Field id="title" label="Title" error={e.title} className="col-span-2">
            <input ref={firstField} {...described("title", e.title)} className="in" maxLength={WORK_LIMITS.title} defaultValue={current.title} />
          </Field>
          <Field id="year" label="Year" error={e.year}>
            <input {...described("year", e.year)} className="in mono" maxLength={WORK_LIMITS.year} defaultValue={current.year} />
          </Field>
          <Field id="category" label="Category" error={e.category}>
            <select {...described("category", e.category)} className="in" defaultValue={current.category}>
              {MEDIUMS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field id="medium" label="Medium" error={e.medium} className="col-span-2">
            <input {...described("medium", e.medium)} className="in" maxLength={WORK_LIMITS.medium} placeholder="Oil on linen" defaultValue={current.medium} />
          </Field>
          <Field id="dimensions" label="Dimensions" error={e.dimensions}>
            <input {...described("dimensions", e.dimensions)} className="in" maxLength={WORK_LIMITS.dimensions} placeholder="100 × 80 cm" defaultValue={current.dimensions} />
          </Field>
          <Field id="availability" label="Availability" error={e.availability}>
            <select {...described("availability", e.availability)} className="in" defaultValue={current.availability}>
              {Object.entries(AVAILABILITY).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field id="price" label="Price (SEK)" error={e.price} hint={priceHint} className="col-span-2">
            <input
              {...described("price", e.price, true)}
              className="in mono"
              inputMode="numeric"
              maxLength={14}
              placeholder="12 500"
              value={priceText}
              onChange={(ev) => setPriceText(ev.target.value)}
            />
          </Field>

          <fieldset className="col-span-2 flex flex-col gap-2">
            <legend className="lbl mb-2">Style</legend>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <label key={s} className="chip has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2">
                  <input type="checkbox" name="styles" value={s} defaultChecked={current.styles.includes(s)} className="sr-only" />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <Field id="subject" label="Subject" error={e.subject} className="col-span-2">
            <select {...described("subject", e.subject)} className="in" defaultValue={current.subject ?? ""}>
              <option value="">Not set</option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div className="col-span-2 flex flex-col gap-1.5">
            <span className="lbl">Colours</span>
            <p className="text-sm text-[#555]">
              {colourLabels.length ? colourLabels.join(", ") : "None detected"}
              <span className="hint ml-2">Detected from the image.</span>
            </p>
          </div>

          <Field id="alt" label="Image description (alt text)" error={e.alt} className="col-span-2" hint="Describes the work for people using screen readers.">
            <input {...described("alt", e.alt, true)} className="in" maxLength={WORK_LIMITS.alt} defaultValue={current.alt} />
          </Field>
          <Field id="description" label="Description" error={e.description} className="col-span-2">
            <textarea {...described("description", e.description)} className="in" maxLength={WORK_LIMITS.description} defaultValue={current.description} />
          </Field>

          <label className="check col-span-2">
            <input type="checkbox" name="published" defaultChecked={current.published} />
            Published. Show this work in Artworks and on your profile.
          </label>

          <div className="col-span-2 flex flex-wrap items-center gap-5 border-t border-line pt-6">
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <span className="hint" role="status">
              {state.status === "saved" && !pending && "Saved."}
              {state.message && <span className="field-error">{state.message}</span>}
            </span>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          {current.published ? (
            <Link href={`/artworks/${artistSlug}/${current.slug}`} className="textbtn">
              View public page
            </Link>
          ) : (
            <span className="hint">Drafts are visible only to you.</span>
          )}
          <button
            type="button"
            className="textbtn text-error hover:text-error"
            disabled={deleting}
            onClick={async () => {
              if (!confirmDelete) return setConfirmDelete(true);
              setDeleting(true);
              const r = await deleteWork(work.id);
              if (r.ok) onDeleted(work.id);
              else setDeleting(false);
            }}
          >
            {deleting ? "Removing…" : confirmDelete ? "Click again to remove permanently" : "Remove listing"}
          </button>
        </div>
      </div>
    </>
  );
}
