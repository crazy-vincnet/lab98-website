import { renderOgImage } from "@/lib/og/render";
import { aboutCopy } from "@/components/about/copy";
import { getSiteContent } from "@/lib/site-content";
import { fill } from "@/lib/fill-template";
import { getSeoOgKo } from "@/components/seo/seo-copy";

export const alt = `${aboutCopy.hero.title} — 웹·프로그램 제작, AI 교육, 교회와 선교단체를 위한 프로그램`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getSiteContent("ko"); // admin-editable (site.info)
  const og = (await getSeoOgKo()).about;
  return renderOgImage({
    tag: "ABOUT",
    title: aboutCopy.hero.title,
    subtitle: fill(og.subtitle, { slogan: site.slogan }),
  });
}
