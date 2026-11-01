import { VERIFICATION_RE } from "@/lib/site-settings";

export type CheckStatus = "ok" | "warn" | "fail";
export type CheckResult = { id: string; label: string; status: CheckStatus; detail: string };

export const MAX_CODE_LENGTH = 200;

/**
 * Accepts either the bare code or a pasted full tag (`<meta name="google-site-verification" content="CODE" />`)
 * and returns the code. Empty input -> "" (clears the setting). Returns null when the result is not a valid code.
 */
export function extractVerificationCode(input: string): string | null {
  const raw = input.trim();
  if (!raw) return "";
  const m = raw.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const code = (m ? (m[1] ?? m[2] ?? "") : raw).trim();
  if (!code || code.length > MAX_CODE_LENGTH || !VERIFICATION_RE.test(code)) return null;
  return code;
}

const UA = "Lab98-Admin-SearchCheck/1.0";

async function get(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
    headers: { "user-agent": UA },
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, text, contentType: res.headers.get("content-type") ?? "" };
}

const safe = async <T,>(fn: () => Promise<T>): Promise<T | { error: string }> => {
  try {
    return await fn();
  } catch (e) {
    return { error: e instanceof Error ? (e.name === "TimeoutError" ? "응답이 늦어요 (10초 초과)" : e.message) : "요청에 실패했어요" };
  }
};

/** Meta tag content for `name`, from live HTML. Handles either attribute order. */
function metaContent(html: string, name: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!new RegExp(`name\\s*=\\s*["']${name}["']`, "i").test(tag)) continue;
    const m = tag.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
    return (m?.[1] ?? m?.[2] ?? "").trim();
  }
  return null;
}

/** Runs all on-demand checks against the live site (fixed URLs, no user input). */
export async function runSearchChecks(siteUrl: string, saved: { google: string; naver: string }): Promise<CheckResult[]> {
  const base = siteUrl.replace(/\/$/, "");
  const [sitemap, robots, llms, llmsEn, rss, home] = await Promise.all([
    safe(() => get(`${base}/sitemap.xml`)),
    safe(() => get(`${base}/robots.txt`)),
    safe(() => get(`${base}/llms.txt`)),
    safe(() => get(`${base}/en/llms.txt`)),
    safe(() => get(`${base}/insights/rss.xml`)),
    safe(() => get(`${base}/`)),
  ]);
  const out: CheckResult[] = [];

  if ("error" in sitemap) out.push({ id: "sitemap", label: "sitemap.xml", status: "fail", detail: sitemap.error });
  else if (!sitemap.ok) out.push({ id: "sitemap", label: "sitemap.xml", status: "fail", detail: `HTTP ${sitemap.status}` });
  else {
    const locs = [...sitemap.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    const en = locs.filter((u) => /^https?:\/\/[^/]+\/en(\/|$)/.test(u)).length;
    out.push({
      id: "sitemap",
      label: "sitemap.xml",
      status: locs.length ? "ok" : "fail",
      detail: locs.length ? `주소 ${locs.length}개 (한국어 ${locs.length - en}, 영어 ${en})` : "주소가 하나도 없어요",
    });
  }

  if ("error" in robots) out.push({ id: "robots", label: "robots.txt", status: "fail", detail: robots.error });
  else if (!robots.ok) out.push({ id: "robots", label: "robots.txt", status: "fail", detail: `HTTP ${robots.status}` });
  else {
    const line = robots.text.split(/\r?\n/).find((l) => /^sitemap:/i.test(l.trim()));
    out.push({ id: "robots", label: "robots.txt", status: line ? "ok" : "warn", detail: line ? line.trim() : "Sitemap 줄이 없어요" });
  }

  for (const [id, label, r] of [["llms", "llms.txt", llms], ["llms-en", "en/llms.txt", llmsEn]] as const) {
    if ("error" in r) out.push({ id, label, status: "fail", detail: r.error });
    else out.push({ id, label, status: r.ok && r.text.trim() ? "ok" : "fail", detail: r.ok ? `${r.text.length.toLocaleString("ko-KR")}자` : `HTTP ${r.status}` });
  }

  if ("error" in rss) out.push({ id: "rss", label: "insights/rss.xml", status: "fail", detail: rss.error });
  else if (!rss.ok) out.push({ id: "rss", label: "insights/rss.xml", status: "fail", detail: `HTTP ${rss.status}` });
  else {
    const items = (rss.text.match(/<item>/g) ?? []).length;
    out.push({ id: "rss", label: "insights/rss.xml", status: /<rss|<feed/.test(rss.text) ? "ok" : "fail", detail: `글 ${items}개` });
  }

  for (const [id, label, name, want] of [
    ["google-tag", "구글 인증 태그 (홈페이지)", "google-site-verification", saved.google],
    ["naver-tag", "네이버 인증 태그 (홈페이지)", "naver-site-verification", saved.naver],
  ] as const) {
    if ("error" in home) out.push({ id, label, status: "fail", detail: home.error });
    else if (!home.ok) out.push({ id, label, status: "fail", detail: `홈페이지 HTTP ${home.status}` });
    else {
      const live = metaContent(home.text, name);
      if (live === null) out.push({ id, label, status: want ? "warn" : "ok", detail: want ? "저장한 코드가 아직 홈페이지에 보이지 않아요. 잠시 뒤에 다시 점검해 보세요." : "코드를 저장하지 않았고, 태그도 없어요." });
      else if (want && live !== want) out.push({ id, label, status: "warn", detail: "홈페이지의 코드가 저장한 코드와 달라요. 잠시 뒤에 다시 점검해 보세요." });
      else out.push({ id, label, status: "ok", detail: "홈페이지에 태그가 있어요." });
    }
  }
  return out;
}
