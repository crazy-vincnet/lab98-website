import { renderOgImage } from "@/lib/og/render";
import { getSiteContent } from "@/lib/site-content";

export const alt = "Lab98 쿠키 정책 문서";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { site } = await getSiteContent("ko"); // admin-editable (site.info)
  return renderOgImage({
    tag: "COOKIES",
    eyebrow: "Lab98 정책",
    title: "쿠키 정책",
    subtitle: `${site.name} · ${site.business.name}`,
  });
}
