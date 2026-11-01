import { notFound } from "next/navigation";
import { renderOgImage } from "@/lib/og/render";
import { divisions } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";

export const alt = "Lab98 사업부 소개 — 사업부 이름, 하는 일, 한 줄 소개";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return divisions.map((d) => ({ slug: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const d = (await getSiteContent("ko")).getDivision((await params).slug); // admin-editable (divisions.data)
  if (!d) notFound();
  return renderOgImage({
    division: d.slug,
    tag: "SERVICES",
    eyebrow: `${d.name} · ${d.role}`,
    title: d.headline,
  });
}
