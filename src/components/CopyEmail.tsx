"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <>
      <span className="text-fg select-all">{email}</span>
      <button type="button" className="textbtn ml-1.5 text-[11px]" onClick={copy}>
        {state === "copied" ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" role="status">
        {state === "copied" ? "Email copied" : state === "failed" ? "Select the address to copy it" : ""}
      </span>
    </>
  );
}
