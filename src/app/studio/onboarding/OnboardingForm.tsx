"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { checkSlug, createArtistProfile, type ProfileFormState } from "../actions";
import { described, Field } from "../Field";
import { LIMITS, SLUG_MAX, slugify } from "@/lib/artist-profile";
import { MEDIUMS } from "@/lib/taxonomy";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(createArtistProfile, { status: "idle" });
  const e = state.errors ?? {};
  const v = (k: string) => state.values?.[k];

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugMsg, setSlugMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const latest = useRef("");

  // Check the address while typing, ignoring answers that arrive after the field has changed.
  useEffect(() => {
    latest.current = slug;
    if (!slug) {
      setSlugMsg(null);
      return;
    }
    const t = setTimeout(async () => {
      const r = await checkSlug(slug);
      if (latest.current === slug) setSlugMsg(r);
    }, 350);
    return () => clearTimeout(t);
  }, [slug]);

  const slugError = e.slug ?? (slugMsg && !slugMsg.ok ? slugMsg.message : undefined);
  const slugHint = slugMsg?.ok ? <span className="text-up">{slugMsg.message}</span> : "Your public address. It cannot be changed later.";

  return (
    <form action={action} noValidate>
      <div className="grid grid-cols-1 gap-x-8 gap-y-[30px] min-[640px]:grid-cols-2">
        <Field id="name" label="Artist name" error={e.name}>
          <input
            {...described("name", e.name)}
            className="in"
            maxLength={LIMITS.name}
            autoComplete="name"
            required
            value={name}
            onChange={(ev) => {
              setName(ev.target.value);
              if (!slugTouched) setSlug(slugify(ev.target.value));
            }}
          />
        </Field>

        <Field id="slug" label="Profile address" error={slugError} hint={slugHint}>
          <div className="flex items-baseline border-b border-line focus-within:border-fg">
            <span className="shrink-0 text-[17px] text-muted">sorary.se/artists/</span>
            <input
              {...described("slug", slugError, true)}
              className="in min-w-0 border-0 pl-0.5"
              maxLength={SLUG_MAX}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
              value={slug}
              onChange={(ev) => {
                setSlugTouched(true);
                setSlug(ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
            />
          </div>
        </Field>

        <Field id="city" label="City" error={e.city}>
          <input {...described("city", e.city)} className="in" maxLength={LIMITS.city} autoComplete="address-level2" defaultValue={v("city")} />
        </Field>
        <Field id="country" label="Country" error={e.country}>
          <input
            {...described("country", e.country)}
            className="in"
            maxLength={LIMITS.country}
            autoComplete="country-name"
            defaultValue={v("country")}
          />
        </Field>

        <Field id="medium" label="Primary medium" error={e.medium}>
          <select {...described("medium", e.medium)} className="in" key={v("medium")} defaultValue={v("medium") ?? "Painting"}>
            {MEDIUMS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field id="born" label="Year of birth" error={e.born}>
          <input
            {...described("born", e.born)}
            className="in mono"
            maxLength={4}
            inputMode="numeric"
            placeholder="Optional"
            defaultValue={v("born")}
          />
        </Field>

        <Field id="statement" label="One-line statement" error={e.statement} className="min-[640px]:col-span-2">
          <input
            {...described("statement", e.statement)}
            className="in"
            maxLength={LIMITS.statement}
            placeholder="What your work is about, in one sentence"
            defaultValue={v("statement")}
          />
        </Field>
      </div>

      {state.message && (
        <p className="field-error mt-6" role="alert">
          {state.message}
        </p>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <Link href="/" className="textbtn">
          Cancel
        </Link>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Creating…" : "Create artist profile"}
        </button>
      </div>
    </form>
  );
}
