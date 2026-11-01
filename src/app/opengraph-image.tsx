import { renderOgImage } from "@/lib/og/render";
import { site as siteDefaults } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";

// `alt` is a static export: code defaults. The image itself uses the admin-editable text.
export const alt = `${siteDefaults.name} — ${siteDefaults.slogan} (${siteDefaults.sloganEn})`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getSiteContent("ko"); // admin-editable (site.info)
  return renderOgImage({ tag: "HOME", title: [...site.sloganLines], subtitle: site.sloganEn });
}
