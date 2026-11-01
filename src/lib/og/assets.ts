/**
 * Build-time assets for Open Graph images (fonts, brand symbol).
 *
 * With `cacheComponents`, image routes are prerendered like pages: only predictable work
 * (module imports, synchronous I/O, pure computation) finishes in the static shell. An
 * `await readFile()` during rendering counts as uncached data and can flip the route to
 * dynamic, so these local files are read synchronously, once, at module scope.
 * See node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md#predictable-values
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Division } from "@/lib/content";

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700 | 800; style: "normal" };

const root = process.cwd();
const fontsource = (pkg: string, file: string) => join(root, "node_modules/@fontsource", pkg, "files", file);

function readBuffer(path: string): ArrayBuffer {
  const buf = readFileSync(path);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

/*
 * Satori reads woff (not woff2). Of IBM Plex Sans KR's fontsource subsets, only `korean` is
 * complete (~11.4k glyphs: all 11,172 Hangul syllables plus Latin and punctuation), so it is the
 * one file loaded per weight (~0.9 MB each). The numbered subsets are tiny unicode-range slices,
 * and registering two files under one family name makes Satori miss Hangul glyphs.
 */
export const OG_FONTS: OgFont[] = [
  { name: "Plex", weight: 700, path: fontsource("ibm-plex-sans-kr", "ibm-plex-sans-kr-korean-700-normal.woff") },
  { name: "Plex", weight: 400, path: fontsource("ibm-plex-sans-kr", "ibm-plex-sans-kr-korean-400-normal.woff") },
  { name: "Archivo", weight: 800, path: fontsource("archivo", "archivo-latin-800-normal.woff") },
  { name: "Mono", weight: 700, path: fontsource("jetbrains-mono", "jetbrains-mono-latin-700-normal.woff") },
].map((f) => ({ name: f.name, weight: f.weight as OgFont["weight"], style: "normal" as const, data: readBuffer(f.path) }));

const DIVISIONS: Division[] = ["master", "dev", "ai", "faith"];

/** The real brand symbol (ink square, "Lab 98", colored dot) as SVG data URLs. */
export const SYMBOL_SRC = Object.fromEntries(
  DIVISIONS.map((d) => [
    d,
    `data:image/svg+xml;base64,${readFileSync(join(root, "public/brand/symbol", `lab98-${d}-symbol.svg`)).toString("base64")}`,
  ]),
) as Record<Division, string>;
