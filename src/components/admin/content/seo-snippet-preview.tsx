import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { DIVISION_SLUGS_FOR_SEO, getSeoOgEn, getSeoOgKo, getSeoPage, getSeoRoot, getSeoService, type SeoPageKey } from "@/components/seo/seo-copy";
import { divisionHref, INSIGHTS_PATH, PRAISE_TOOL_PATH, PROJECTS_PATH } from "@/components/experiments/paths";

/**
 * Read-only "미리보기: 검색 결과 모양" for the seo.* documents (the registry `render` of those keys).
 * <title> and <meta> cannot be shown by rendering the page, so this draws the search-result snippet from the draft
 * (the preview page has switched getCopy to the draft) and counts the length the way search engines cut it
 * (Hangul / CJK count as 2 columns). Server component, admin preview only.
 */

const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;
const width = (s: string) => [...s].reduce((n, c) => n + (/[ᄀ-ᇿ㄰-㆏가-힯　-〿一-鿿＀-￯]/.test(c) ? 2 : 1), 0);

function Counter({ label, text, limit }: { label: string; text: string; limit: number }) {
  const w = width(text);
  const over = w > limit;
  return (
    <p className={`mt-1 text-[13px] ${over ? "font-bold text-[#b42318]" : "text-[#5b6170]"}`}>
      {label} {text.length}자 · 표시 길이 {w} / {limit}
      {over ? " — 검색 결과에서 뒷부분이 …로 잘릴 수 있어요." : ""}
    </p>
  );
}

function Snippet({ title, description, url, heading }: { title: string; description: string; url: string; heading?: string }) {
  return (
    <section className="border-2 border-[#111] bg-white p-5">
      {heading && <h2 className="mb-3 text-[15px] font-bold">{heading}</h2>}
      <p className="break-all text-[13px] text-[#0c6b3c]">{url}</p>
      <p className="mt-1 text-[20px] leading-snug text-[#1a0dab]">{title}</p>
      <p className="mt-1 text-[14px] leading-snug text-[#4d5156]">{description}</p>
      <div className="mt-4 border-t border-[#d9dce3] pt-3">
        <Counter label="제목" text={title} limit={TITLE_LIMIT} />
        <Counter label="설명" text={description} limit={DESC_LIMIT} />
      </div>
    </section>
  );
}

const PAGE_META: Record<SeoPageKey, { path: string; absolute: boolean }> = {
  home: { path: "/", absolute: true },
  about: { path: "/about", absolute: false },
  projects: { path: PROJECTS_PATH, absolute: false },
  insights: { path: INSIGHTS_PATH, absolute: false },
  "praise-tool": { path: PRAISE_TOOL_PATH, absolute: true },
};

export async function SeoSnippetPreview({ docKey, locale }: { docKey: string; locale: Locale }) {
  const { site } = getContent(locale);
  const host = site.url.replace(/\/$/, "");
  const urlOf = (path: string) => `${host}${localePath(locale, path) === "/" ? "" : localePath(locale, path)}`;
  const page = docKey.replace(/^seo\./, "");
  let body: React.ReactNode;

  if (page in PAGE_META) {
    const meta = PAGE_META[page as SeoPageKey];
    const t = await getSeoPage(page as SeoPageKey, locale);
    body = <Snippet title={meta.absolute ? t.title : `${t.title} | ${site.name}`} description={t.description} url={urlOf(meta.path)} />;
  } else if (page === "services") {
    body = (
      <div className="grid gap-4">
        {await Promise.all(
          DIVISION_SLUGS_FOR_SEO.map(async (slug) => {
            const t = await getSeoService(locale, slug);
            return <Snippet key={slug} heading={slug.toUpperCase()} title={t.title} description={t.description} url={urlOf(divisionHref(slug))} />;
          }),
        )}
      </div>
    );
  } else if (page === "root") {
    const r = await getSeoRoot(locale);
    body = (
      <div className="grid gap-4">
        <Snippet heading="제목을 따로 정하지 않은 페이지" title={r.titleDefault} description={site.description} url={urlOf("/")} />
        <section className="border-2 border-[#111] bg-white p-5">
          <h2 className="mb-2 text-[15px] font-bold">검색 키워드 ({r.keywords.length}개)</h2>
          <ul className="flex flex-wrap gap-2 text-[14px]">
            {r.keywords.map((k, i) => (
              <li key={i} className="border border-[#111] px-2 py-1">
                {k}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-[#5b6170]">키워드는 검색엔진이 거의 참고하지 않아요. 설명 문장은 ‘사이트 정보’ 문서에서 고쳐요.</p>
        </section>
      </div>
    );
  } else if (page === "og") {
    const og = (locale === "en" ? await getSeoOgEn() : await getSeoOgKo()) as unknown as Record<string, Record<string, string>>;
    body = (
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(og).map(([card, fields]) => (
          <section key={card} className="aspect-[1200/630] border-2 border-[#111] bg-[#111] p-5 text-white">
            <p className="text-[12px] uppercase tracking-wide text-[#aab]">{card}</p>
            {Object.entries(fields).map(([k, v]) => (
              <p key={k} className={k === "title" ? "mt-2 text-[22px] font-bold leading-tight" : "mt-2 text-[14px] text-[#d4d7df]"}>
                {v}
              </p>
            ))}
          </section>
        ))}
      </div>
    );
  } else {
    body = <p>이 문서는 미리보기를 지원하지 않아요.</p>;
  }

  return (
    <div lang="ko" className="mx-auto max-w-[760px] p-6">
      <h1 className="mb-1 text-[20px] font-bold">미리보기: {docKey === "seo.og" ? "공유 카드 문구" : "검색 결과 모양"}</h1>
      <p className="mb-5 text-[14px] text-[#5b6170]">
        {docKey === "seo.og"
          ? "카드 이미지에 들어가는 글자예요. 실제 이미지는 글꼴과 배경이 더해져 다르게 보이고, 공개하면 카드가 새로 만들어져요."
          : "저장한 초안으로 그린 대략적인 모양이에요. 실제 검색 결과는 검색엔진이 다르게 보여 줄 수 있어요."}
      </p>
      {body}
    </div>
  );
}
