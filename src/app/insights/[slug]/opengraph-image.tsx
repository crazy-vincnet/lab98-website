import { notFound } from "next/navigation";
import { renderOgImage } from "@/lib/og/render";
import { formatDate } from "@/lib/content";
import { getInsight, getInsightSlugs } from "@/lib/insights";

export const alt = "Lab98 인사이트 글 — 제목, 글쓴이, 날짜";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Static notes + posts live at build time; posts published later are rendered on first request (dynamicParams). */
export function generateStaticParams() {
  return getInsightSlugs("ko");
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const note = await getInsight("ko", (await params).slug);
  if (!note) notFound();
  // Break long "A: B" titles after the colon so the card reads as headline + kicker.
  const parts = note.title.split(/(?<=:)\s+/);
  return renderOgImage({
    tag: "INSIGHTS",
    title: parts.length === 2 ? parts : note.title,
    subtitle: [note.author, formatDate(note.date)],
  });
}
