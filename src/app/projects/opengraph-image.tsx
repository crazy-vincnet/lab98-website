import { renderOgImage } from "@/lib/og/render";
import { projects } from "@/lib/content";

export const alt = "Lab98 Dev가 만든 사이트 — 기획부터 디자인, 개발까지 맡은 프로젝트 목록";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    division: "dev",
    tag: "PROJECTS",
    title: "Lab98 Dev가 만든 사이트",
    subtitle: "기획 · 디자인 · 개발",
    chips: projects.map((p) => p.client),
  });
}
