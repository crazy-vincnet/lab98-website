import { renderOgImage } from "@/lib/og/render";
import { aboutCopy } from "@/components/about/copy";
import { site } from "@/lib/content";

export const alt = `${aboutCopy.hero.title} — 웹·프로그램 제작, AI 교육, 교회와 선교단체를 위한 프로그램`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    tag: "ABOUT",
    title: aboutCopy.hero.title,
    subtitle: `Dev · AI · Faith — ${site.slogan}`,
  });
}
