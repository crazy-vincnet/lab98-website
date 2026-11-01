import { renderOgImage } from "@/lib/og/render";
import { getContent } from "@/lib/get-content";
import { getSiteContent } from "@/lib/site-content";
import { getSeoOgEn } from "@/components/seo/seo-copy";

const siteDefaults = getContent("en").site;

// TODO(en): English subpages (/en/about, /en/projects/…) inherit this card; add per-route English cards later.
export const alt = `${siteDefaults.name} — ${siteDefaults.sloganEn}`; // static export: code defaults
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getSiteContent("en"); // admin-editable (site.info)
  const og = await getSeoOgEn();
  return renderOgImage({ tag: "HOME", title: [...site.sloganLines], subtitle: og.home.subtitle });
}
