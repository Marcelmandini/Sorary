"use client";

import { useActionState } from "react";
import { sendSignInLink, type SignInState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(sendSignInLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="flex animate-fade flex-col gap-2.5 border border-fg p-8" role="status">
        <span className="eyebrow">Check your email</span>
        <h2 className="text-[28px] tracking-[-.01em]">A sign-in link is on its way.</h2>
        <p className="text-[#555]">
          We sent it to <span className="text-fg">{state.email}</span>. Open it on this device to continue. The link
          works once and expires after an hour.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-7" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="in"
          autoComplete="email"
          inputMode="email"
          maxLength={160}
          required
          defaultValue={state.email}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? "email-error" : undefined}
          placeholder="you@example.com"
        />
        {state.status === "error" && (
          <span id="email-error" className="field-error" role="alert">
            {state.message}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : "Email me a sign-in link"}
        </button>
      </div>
      <p className="hint">No password needed. New here? The same link creates your account.</p>
    </form>
  );
}
