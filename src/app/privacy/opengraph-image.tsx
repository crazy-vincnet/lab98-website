import { renderOgImage } from "@/lib/og/render";
import { site } from "@/lib/content";

export const alt = "Lab98 개인정보처리방침 문서";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    tag: "PRIVACY",
    eyebrow: "Lab98 정책",
    title: "개인정보처리방침",
    subtitle: `${site.name} · ${site.business.name}`,
  });
}
