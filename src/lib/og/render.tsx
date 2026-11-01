/**
 * Shared Open Graph / Twitter card renderer (1200×630 PNG via next/og).
 * Brand rules: radius 0, 2px ink borders, no shadows, one division-colored accent.
 */
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { site, type Division } from "@/lib/content";
import { OG_FONTS, SYMBOL_SRC } from "./assets";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const C = {
  ink: "#111111",
  paper: "#ffffff",
  concrete: "#E6E6E3",
  muted: "#55554F",
} as const;

export const ACCENT: Record<Division, string> = {
  master: "#E8322B",
  dev: "#2F55FF",
  ai: "#14C38E",
  faith: "#F2B21B",
};

const LABEL: Record<Division, string> = { master: "LAB98", dev: "LAB98 · DEV", ai: "LAB98 · AI", faith: "LAB98 · FAITH" };

export type OgCardOptions = {
  division?: Division;
  /** Small uppercase line next to the symbol. Defaults to the division label. */
  label?: string;
  /** Section tag in the bottom-right box, e.g. "PROJECTS". */
  tag: string;
  /** Big title. A string is wrapped automatically; an array forces one line per item. */
  title: string | string[];
  /** Use the Archivo display face for the title (for Latin wordmarks like "Praise Tool"). */
  displayTitle?: boolean;
  /** Lines under the title. */
  subtitle?: string | string[];
  /** Small eyebrow above the title. */
  eyebrow?: string;
  /** Right-half screenshot in an ink browser frame: a PNG data URL (see ./screenshots). */
  screenshot?: string;
  /** Extra row under the subtitle (e.g. client chips). */
  chips?: string[];
};

function titleSize(title: string | string[], narrow: boolean, display: boolean): number {
  const lines = Array.isArray(title) ? title : [title];
  const longest = Math.max(...lines.map((l) => l.length));
  const total = lines.join("").length;
  if (display) return narrow ? 80 : 120;
  const width = narrow ? 0.55 : 1;
  const len = Array.isArray(title) ? longest : total / 2; // a wrapped string spreads over ~2 lines
  if (len <= 10 * width) return narrow ? 60 : 76;
  if (len <= 14 * width) return narrow ? 54 : 70;
  if (len <= 18 * width) return narrow ? 48 : 62;
  if (len <= 24 * width) return narrow ? 42 : 54;
  return narrow ? 38 : 48;
}

/** Screenshot box inside the browser frame (./screenshots renders PNGs at 2× this). */
export const SHOT = { width: 500, height: 312 } as const;

/** Rough rendered width in em: Hangul/CJK ≈ 0.95em, everything else ≈ 0.56em. */
function emWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u4e00-\u9fff]/.test(ch) ? 0.95 : ch === " " ? 0.28 : 0.56;
  return w;
}

/**
 * Splits a title that would wrap into two balanced lines at a space, so cards never end on
 * a one-word orphan. Titles that fit on one line, or need 3+ lines, are left to wrap naturally.
 */
function balanceTitle(title: string, fontSize: number, maxWidth: number): string | string[] {
  const words = title.split(" ");
  const full = emWidth(title) * fontSize;
  if (words.length < 2 || full <= maxWidth || full > maxWidth * 2) return title;
  let best: string[] | undefined;
  let bestMax = Infinity;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const max = Math.max(...lines.map((l) => emWidth(l) * fontSize));
    if (max < bestMax) [best, bestMax] = [lines, max];
  }
  return best && bestMax <= maxWidth ? best : title;
}

/** Pure render: all assets are preloaded at module scope, so this stays prerenderable. */
export function renderOgImage(o: OgCardOptions): ImageResponse {
  const division = o.division ?? "master";
  const accent = ACCENT[division];
  const symbol = SYMBOL_SRC[division];
  const shot = o.screenshot;
  const narrow = Boolean(shot);
  const display = Boolean(o.displayTitle);
  const fontSize = titleSize(o.title, narrow, display);
  const maxTitleWidth = narrow ? 1092 - 52 * 2 - 44 - SHOT.width - 4 : 1092 - 52 * 2;
  const title = typeof o.title === "string" && !display ? balanceTitle(o.title, fontSize, maxTitleWidth) : o.title;
  const titleLines = Array.isArray(title) ? title : [title];
  const subtitleLines = o.subtitle ? (Array.isArray(o.subtitle) ? o.subtitle : [o.subtitle]) : [];

  const text: ReactNode = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
      {o.eyebrow && (
        <div style={{ display: "flex", fontFamily: "Plex", fontWeight: 700, fontSize: 28, color: C.muted, marginBottom: 18 }}>
          {o.eyebrow}
        </div>
      )}
      <div style={{ display: "flex", flexShrink: 0, width: 72, height: 8, background: accent, marginBottom: 26 }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {titleLines.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              fontFamily: display ? "Archivo" : "Plex",
              fontWeight: display ? 800 : 700,
              fontSize,
              lineHeight: display ? 1 : 1.2,
              letterSpacing: display ? "-0.03em" : "-0.02em",
              color: C.ink,
              wordBreak: "keep-all",
              lineClamp: Array.isArray(title) ? 1 : 3,
            }}
          >
            {line}
          </div>
        ))}
      </div>
      {subtitleLines.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
          {subtitleLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                fontFamily: "Plex",
                fontWeight: i === 0 ? 700 : 400,
                fontSize: narrow ? 26 : 30,
                lineHeight: 1.4,
                color: i === 0 ? C.ink : C.muted,
                wordBreak: "keep-all",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}
      {o.chips && o.chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 30 }}>
          {o.chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                border: `2px solid ${C.ink}`,
                padding: "6px 14px",
                marginRight: 10,
                marginBottom: 10,
                fontFamily: "Plex",
                fontWeight: 700,
                fontSize: 22,
                color: C.ink,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.paper, padding: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            border: `2px solid ${C.ink}`,
            padding: "40px 52px 36px",
          }}
        >
          {/* Top: brand symbol + label */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
            <img src={symbol} width={76} height={76} alt="" />
            <div
              style={{
                display: "flex",
                marginLeft: 22,
                fontFamily: "Mono",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.12em",
                color: C.ink,
              }}
            >
              {o.label ?? LABEL[division]}
            </div>
          </div>

          {/* Middle: text (+ screenshot) */}
          <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 24, marginBottom: 16, overflow: "hidden" }}>
            {text}
            {shot && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: 44,
                  border: `2px solid ${C.ink}`,
                  background: C.ink,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", height: 26, paddingLeft: 10 }}>
                  {[accent, C.concrete, C.concrete].map((c, i) => (
                    <div key={i} style={{ display: "flex", width: 10, height: 10, background: c, marginRight: 8 }} />
                  ))}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
                <img src={shot} width={SHOT.width} height={SHOT.height} alt="" style={{ display: "flex" }} />
              </div>
            )}
          </div>

          {/* Bottom: domain + section tag */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 800, fontSize: 30, color: C.ink }}>
              {site.url.replace(/^https?:\/\//, "")}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `2px solid ${C.ink}`,
                padding: "8px 16px",
                fontFamily: "Mono",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.12em",
                color: C.ink,
              }}
            >
              <div style={{ display: "flex", width: 12, height: 12, background: accent, marginRight: 12 }} />
              {o.tag}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
