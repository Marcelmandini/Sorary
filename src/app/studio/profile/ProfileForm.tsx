"use client";

import { useActionState } from "react";
import { updateArtistProfile, type ProfileFormState } from "../actions";
import { described, Field } from "../Field";
import { LIMITS } from "@/lib/artist-profile";
import type { ArtistRow } from "@/lib/data/artists";
import { MEDIUMS } from "@/lib/taxonomy";

export function ProfileForm({ artist }: { artist: ArtistRow }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateArtistProfile, { status: "idle" });
  const e = state.errors ?? {};
  // After a submit React resets the form; show what was submitted rather than the original values.
  const v = (k: keyof ArtistRow) => state.values?.[k] ?? String(artist[k] ?? "");
  const listed = state.values ? state.values.listed === "on" : artist.listed;
  const formKey = JSON.stringify(state.values ?? null);

  return (
    <form action={action} noValidate className="max-w-[820px]" key={formKey}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-[30px] min-[640px]:grid-cols-2">
        <Field id="name" label="Artist name" error={e.name}>
          <input {...described("name", e.name)} className="in" maxLength={LIMITS.name} required defaultValue={v("name")} />
        </Field>
        <div className="field">
          <span className="lbl">Profile address</span>
          <p className="py-2.5 text-[17px] break-all">sorary.se/artists/{artist.slug}</p>
        </div>

        <Field id="city" label="City" error={e.city}>
          <input {...described("city", e.city)} className="in" maxLength={LIMITS.city} defaultValue={v("city")} />
        </Field>
        <Field id="country" label="Country" error={e.country}>
          <input {...described("country", e.country)} className="in" maxLength={LIMITS.country} defaultValue={v("country")} />
        </Field>

        <Field id="medium" label="Primary medium" error={e.medium}>
          <select {...described("medium", e.medium)} className="in" defaultValue={v("medium")}>
            {MEDIUMS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field id="born" label="Year of birth" error={e.born}>
          <input {...described("born", e.born)} className="in mono" maxLength={4} inputMode="numeric" placeholder="Optional" defaultValue={v("born")} />
        </Field>

        <Field id="statement" label="One-line statement" error={e.statement} className="min-[640px]:col-span-2">
          <input {...described("statement", e.statement)} className="in" maxLength={LIMITS.statement} defaultValue={v("statement")} />
        </Field>

        <Field
          id="bio"
          label="Biography"
          error={e.bio}
          hint={`Up to ${LIMITS.bio} characters. Line breaks are kept.`}
          className="min-[640px]:col-span-2"
        >
          <textarea {...described("bio", e.bio, true)} className="in min-h-[200px]" maxLength={LIMITS.bio} defaultValue={v("bio")} />
        </Field>

        <Field id="website" label="Website" error={e.website}>
          <input
            {...described("website", e.website)}
            className="in"
            type="url"
            inputMode="url"
            maxLength={LIMITS.website}
            placeholder="yourstudio.com"
            defaultValue={v("website")}
          />
        </Field>
        <Field id="instagram" label="Instagram" error={e.instagram}>
          <input
            {...described("instagram", e.instagram)}
            className="in"
            maxLength={LIMITS.instagram}
            placeholder="@yourstudio"
            autoCapitalize="off"
            spellCheck={false}
            defaultValue={v("instagram")}
          />
        </Field>

        <label className="check min-[640px]:col-span-2">
          <input type="checkbox" name="listed" defaultChecked={listed} />
          Listed on SORARY. Turn this off to hide your profile from the marketplace.
        </label>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-5 border-t border-line pt-7">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <span className="hint" role="status">
          {state.status === "saved" && !pending ? "Saved." : ""}
          {state.message ? <span className="field-error">{state.message}</span> : null}
        </span>
      </div>
    </form>
  );
}
