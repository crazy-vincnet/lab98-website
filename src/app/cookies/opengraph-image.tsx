import { renderOgImage } from "@/lib/og/render";
import { site } from "@/lib/content";

export const alt = "Lab98 쿠키 정책 문서";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    tag: "COOKIES",
    eyebrow: "Lab98 정책",
    title: "쿠키 정책",
    subtitle: `${site.name} · ${site.business.name}`,
  });
}
