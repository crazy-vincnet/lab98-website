import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "./cx";

/** Scrolls sideways on narrow screens instead of breaking the page. `caption` is read by screen readers. */
export function Table({ caption, children, className }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("overflow-x-auto border border-line", className)} tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
export const THead = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} className={cx("bg-concrete", p.className)} />;
export const TBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const Tr = (p: HTMLAttributes<HTMLTableRowElement>) => <tr {...p} className={cx("border-t border-line first:border-t-0", p.className)} />;
export const Th = (p: ThHTMLAttributes<HTMLTableCellElement>) => <th scope="col" {...p} className={cx("px-3 py-2 text-[14px] font-bold", p.className)} />;
export const Td = (p: TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} className={cx("px-3 py-2 align-top", p.className)} />;

/** "Nothing here yet" row spanning all columns. */
export function EmptyRow({ cols, children = "내용이 없어요." }: { cols: number; children?: ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-8 text-center text-gray">
        {children}
      </td>
    </tr>
  );
}
