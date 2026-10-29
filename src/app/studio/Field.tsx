import type { ReactNode } from "react";

/** Label + control + hint/error, wired up for screen readers. */
export function Field({
  id,
  label,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span id={`${id}-msg`} className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-msg`} className="hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** aria props for a control inside <Field>. */
export const described = (id: string, error?: string, hasHint?: boolean) => ({
  id,
  name: id,
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error || hasHint ? `${id}-msg` : undefined,
});
