import { notFound } from "next/navigation";
import { renderOgImage } from "@/lib/og/render";
import { projects } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";
import { PROJECT_SCREENSHOTS } from "@/lib/og/screenshots";

export const alt = "Lab98 Dev 프로젝트 — 고객사 이름, 만든 웹사이트, 실제 화면 스크린샷";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = (await getSiteContent("ko")).getProject((await params).slug); // admin-editable (projects.data)
  if (!p) notFound();
  return renderOgImage({
    division: p.division,
    tag: "PROJECTS",
    eyebrow: p.clientEn ? `${p.client} · ${p.clientEn}` : p.client,
    title: p.title,
    subtitle: `${p.type} · ${p.scope}`,
    screenshot: PROJECT_SCREENSHOTS[p.slug],
  });
}
