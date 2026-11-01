import type { ReactNode } from "react";
import { site } from "@/lib/content";

/**
 * Shared layout for 개인정보처리방침 / 이용약관 / 쿠키 정책.
 * Sections are numbered in order; each gets an anchor (`#${id}`) linked from the table of contents.
 */
export type LegalSection = { id: string; title: string; body: ReactNode };
export type LegalHistoryEntry = { date: string; note: string };

const bodyStyles =
  "flex flex-col gap-3 text-body text-pretty [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-red-text [&_h3]:mt-3 [&_h3]:text-title-sm [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-6 [&_ul>li]:relative [&_ul>li]:pl-5 [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:content-['–'] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2";

export function LegalDoc({
  label,
  title,
  intro,
  effectiveDate,
  sections,
  history,
}: {
  label: string;
  title: string;
  intro: ReactNode;
  effectiveDate: string;
  sections: LegalSection[];
  history: LegalHistoryEntry[];
}) {
  const biz = site.business;
  return (
    <section className="wrap py-16 md:py-24">
      <p lang="en" className="label text-gray">
        {label}
      </p>
      <h1 className="mt-6 text-h1 text-balance">{title}</h1>
      <div className="mt-5 max-w-[680px] text-lead text-gray text-pretty">{intro}</div>
      <p className="mt-4 font-mono text-meta text-gray">시행일 {effectiveDate}</p>
      {/* 사업장 주소는 site.business.address가 채워지면 자동으로 표시돼요. */}
      <p className="mt-2 text-body-sm text-gray text-pretty">
        상호 {biz.name} · 대표 {biz.representative} · 사업자등록번호 {biz.registrationNumber}
        {biz.address ? <> · 주소 {biz.address}</> : null} · 문의 <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-red-text">{site.email}</a>
      </p>

      <nav aria-labelledby="legal-toc" className="mt-12 max-w-[760px] border-2 border-ink p-5 md:p-7">
        <h2 id="legal-toc" className="label ko-tight">
          목차
        </h2>
        <ol className="mt-4 grid gap-x-8 text-body-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex min-h-11 items-center gap-3 py-1 hover:text-red-text hover:underline hover:underline-offset-4">
                <span className="w-6 shrink-0 font-mono text-meta text-gray">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 max-w-[760px] border-t-2 border-ink">
        {sections.map((s, i) => (
          <article key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24 border-b-2 border-ink py-8">
            <h2 id={`${s.id}-title`} className="text-title">
              {i + 1}. {s.title}
            </h2>
            <div className={`mt-4 ${bodyStyles}`}>{s.body}</div>
          </article>
        ))}
        <section aria-labelledby="legal-history" className="py-8">
          <h2 id="legal-history" className="text-title">
            변경 이력
          </h2>
          <ul className="mt-4 flex flex-col gap-2 font-mono text-meta">
            {history.map((h) => (
              <li key={h.date + h.note}>
                {h.date} · {h.note}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

/**
 * Bordered table. ≥768px: a normal table. Below: each row stacks as a card,
 * each cell prefixed with its column header (no horizontal page overflow at 390px).
 */
export function LegalTable({ caption, columns, rows }: { caption?: string; columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="border-2 border-ink">
      <table className="w-full border-collapse text-left text-body-sm max-md:block">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="max-md:sr-only">
          <tr className="border-b-2 border-ink bg-concrete">
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 align-top font-bold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:block">
          {rows.map((row, r) => (
            <tr key={r} className="border-b-2 border-ink last:border-b-0 max-md:block max-md:py-2">
              {row.map((cell, c) => (
                <td
                  key={c}
                  data-label={columns[c]}
                  className="px-4 py-3 align-top max-md:block max-md:py-1.5 max-md:before:block max-md:before:font-mono max-md:before:text-meta max-md:before:text-gray max-md:before:content-[attr(data-label)] md:[&:not(:last-child)]:border-r-2 md:[&:not(:last-child)]:border-ink"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
