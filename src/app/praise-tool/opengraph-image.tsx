import { renderOgImage } from "@/lib/og/render";
import { formatDate, PRAISE_TOOL_LAUNCH } from "@/lib/content";

export const alt = "Praise Tool — 예배를 위한 가사·미디어 송출 프로그램, 2026년 11월 11일 출시, 10만 원 영구 라이선스";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    division: "faith",
    tag: "PRAISE TOOL",
    displayTitle: true,
    title: "Praise Tool",
    subtitle: ["예배를 위한 가사·미디어 송출 프로그램", `${formatDate(PRAISE_TOOL_LAUNCH)} 출시 · 10만 원 영구 라이선스`],
  });
}
