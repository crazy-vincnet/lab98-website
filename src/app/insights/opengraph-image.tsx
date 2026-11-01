import { renderOgImage } from "@/lib/og/render";
import { getSiteContent } from "@/lib/site-content";
import { getSeoOgKo } from "@/components/seo/seo-copy";

export const alt = "Lab98 인사이트 — 웹과 프로그램, AI 교육, 사역 도구를 만들며 배운 것";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getSiteContent("ko"); // admin-editable (site.info)
  const og = (await getSeoOgKo()).insights;
  return renderOgImage({
    tag: "INSIGHTS",
    title: og.title,
    subtitle: [og.subtitle, site.founder.display],
  });
}
