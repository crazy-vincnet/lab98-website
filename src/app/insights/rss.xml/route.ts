import { site } from "@/lib/content";
import { getInsights } from "@/lib/insights";
import { INSIGHTS_PATH, insightHref } from "@/components/experiments/paths";
import { RSS_PATH, RSS_TITLE, absoluteUrl } from "@/lib/seo";

/**
 * /insights/rss.xml — RSS 2.0 feed of insight posts (Korean): static notes + published posts from the DB.
 * Prerendered at build; the DB part comes from a `"use cache"` function (tag `posts`, ~1 minute), so new posts appear without a deploy.
 */

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
/** CDATA can't contain "]]>" — split it across two sections. */
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
/** Static note dates are KST calendar days; DB posts carry the exact instant. */
const rfc822 = (isoDate: string, instant?: string) => new Date(instant ?? `${isoDate}T09:00:00+09:00`).toUTCString();

export async function GET() {
  const sorted = await getInsights("ko");
  const items = sorted
    .map((n) => {
      const link = absoluteUrl(insightHref(n.slug));
      return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(n.date, n.published)}</pubDate>
      <dc:creator>${escapeXml(n.author)}</dc:creator>
      <description>${cdata(n.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = sorted[0] ? `\n    <lastBuildDate>${rfc822(sorted[0].date, sorted[0].published)}</lastBuildDate>` : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(RSS_TITLE)}</title>
    <link>${absoluteUrl(INSIGHTS_PATH)}</link>
    <description>${cdata(site.description)}</description>
    <language>ko-KR</language>
    <copyright>${escapeXml(`© ${site.name}`)}</copyright>${lastBuild}
    <atom:link href="${absoluteUrl(RSS_PATH)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
