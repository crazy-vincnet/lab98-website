import { renderOgImage } from "@/lib/og/render";
import { site } from "@/lib/content";

export const alt = "Lab98 인사이트 — 웹과 프로그램, AI 교육, 사역 도구를 만들며 배운 것";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    tag: "INSIGHTS",
    title: "Lab98이 일하며 생각하고 배운 것",
    subtitle: ["웹·프로그램 · AI 교육 · 사역 도구", site.founder.display],
  });
}
