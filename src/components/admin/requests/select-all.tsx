"use client";

/** "전체 선택" for a group of checkboxes with the same name inside the same <form>. */
export function SelectAll({ name, label = "전체 선택" }: { name: string; label?: string }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px]">
      <input
        type="checkbox"
        className="size-5"
        onChange={(e) => {
          const form = e.currentTarget.form;
          form?.querySelectorAll<HTMLInputElement>(`input[type=checkbox][name="${name}"]`).forEach((c) => (c.checked = e.currentTarget.checked));
        }}
      />
      {label}
    </label>
  );
}
