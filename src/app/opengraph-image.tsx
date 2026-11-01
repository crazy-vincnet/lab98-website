import { renderOgImage } from "@/lib/og/render";
import { site } from "@/lib/content";

export const alt = `${site.name} — ${site.slogan} (${site.sloganEn})`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ tag: "HOME", title: [...site.sloganLines], subtitle: site.sloganEn });
}
