import { notes, site } from "@/lib/content";
import { INSIGHTS_PATH, insightHref } from "@/components/experiments/paths";
import { RSS_PATH, RSS_TITLE, absoluteUrl } from "@/lib/seo";

/**
 * /insights/rss.xml — RSS 2.0 feed of insight posts. Static content only, so it is prerendered at build
 * (Cache Components: GET handlers follow the page prerendering model).
 */

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
/** CDATA can't contain "]]>" — split it across two sections. */
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
/** Note dates are KST calendar days. */
const rfc822 = (isoDate: string) => new Date(`${isoDate}T09:00:00+09:00`).toUTCString();

export function GET() {
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
  const items = sorted
    .map((n) => {
      const link = absoluteUrl(insightHref(n.slug));
      return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(n.date)}</pubDate>
      <dc:creator>${escapeXml(n.author)}</dc:creator>
      <description>${cdata(n.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = sorted[0] ? `\n    <lastBuildDate>${rfc822(sorted[0].date)}</lastBuildDate>` : "";
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
