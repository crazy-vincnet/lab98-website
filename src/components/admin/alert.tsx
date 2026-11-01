import type { ReactNode } from "react";
import { cx } from "./cx";

/** Inline message inside a page or form. Errors use role=alert, the rest role=status. */
export function Alert({ kind = "info", children, className }: { kind?: "info" | "ok" | "error"; children: ReactNode; className?: string }) {
  const tone = {
    info: "border-[#2f55ff] bg-[#eef1ff]",
    ok: "border-[#0c8560] bg-[#e8f8f1]",
    error: "border-[#b42318] bg-[#fff1ef]",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cx("border-l-4 px-4 py-3 text-[15px] leading-snug", tone, className)}>
      {children}
    </div>
  );
}
