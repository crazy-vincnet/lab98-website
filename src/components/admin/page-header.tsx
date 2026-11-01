import type { ReactNode } from "react";

/** Top of every admin page: one <h1>, optional description and right-aligned actions. */
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        {description && <p className="mt-1 max-w-[65ch] text-[16px] text-gray">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
