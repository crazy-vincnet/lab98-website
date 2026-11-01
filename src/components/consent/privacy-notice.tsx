/**
 * "개인정보 수집·이용 안내" block shown above a form's required consent checkbox
 * (개인정보 보호법 제15조 ②: 목적 · 항목 · 보유·이용기간 · 거부권과 불이익).
 * Copy lives with each form (home/copy.ts, lib/praise-tool.ts); this only lays it out.
 */
export type PrivacyNoticeCopy = {
  title: string;
  /** `note` = a smaller line under the description (e.g. the IP-hash notice under 항목). */
  rows: readonly { term: string; desc: string; note?: string }[];
};

export function PrivacyNotice({ id, copy }: { id: string; copy: PrivacyNoticeCopy }) {
  return (
    <div id={id} className="border-2 border-ink text-body-sm">
      <p className="border-b-2 border-ink bg-concrete px-4 py-2.5 font-bold">{copy.title}</p>
      <dl className="divide-y divide-line">
        {copy.rows.map((r) => (
          <div key={r.term} className="grid gap-0.5 px-4 py-2.5 sm:grid-cols-[96px_1fr] sm:gap-4">
            <dt className="font-bold">{r.term}</dt>
            <dd className="text-gray text-pretty">
              {r.desc}
              {r.note && <span className="mt-1 block text-meta tracking-normal">{r.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
