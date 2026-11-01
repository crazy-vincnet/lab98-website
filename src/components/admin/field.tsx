import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "./cx";

const control =
  "block min-h-11 w-full border border-ink bg-paper px-3 py-2 text-[16px] text-ink placeholder:text-placeholder disabled:bg-concrete aria-[invalid=true]:border-[#b42318] aria-[invalid=true]:bg-[#fff6f5]";

export const TextInput = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(control, p.className)} />;
export const TextArea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={cx(control, "leading-relaxed", p.className)} />;
export const SelectInput = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(control, p.className)} />;

type ControlProps = { id: string; "aria-describedby"?: string; "aria-invalid"?: true };

/**
 * Label + control + hint + error, wired with ids for screen readers.
 *   <Field id="email" label="이메일" error={errors.email}>{(p) => <TextInput {...p} name="email" type="email" />}</Field>
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (props: ControlProps) => ReactNode;
  className?: string;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, ...(error ? { "aria-invalid": true as const } : {}) })}
      {hint && (
        <p id={`${id}-hint`} className="text-[14px] leading-snug text-gray">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[14px] font-bold leading-snug text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}
