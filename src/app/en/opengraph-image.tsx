import { renderOgImage } from "@/lib/og/render";
import { getContent } from "@/lib/get-content";

const { site } = getContent("en");

// TODO(en): English subpages (/en/about, /en/projects/…) inherit this card; add per-route English cards later.
export const alt = `${site.name} — ${site.sloganEn}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ tag: "HOME", title: [...site.sloganLines], subtitle: "Dev · AI · Faith" });
}
