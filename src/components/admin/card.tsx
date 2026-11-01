import type { ReactNode } from "react";
import { cx } from "./cx";

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("border border-line bg-paper", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          {title && <h2 className="text-[17px] font-bold">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** A number with a label, optionally a link target. Used on the dashboard. */
export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="border border-line bg-paper p-4">
      <p className="text-[14px] text-gray">{label}</p>
      <p className="mt-1 text-[32px] font-bold leading-none">{value}</p>
      {note && <p className="mt-2 text-[14px] text-gray">{note}</p>}
    </div>
  );
}
