/**
 * Project screenshots for share images. public/projects/*.webp → PNG data URLs, because
 * Satori can't decode webp. sharp (shipped with Next.js) is async, so every screenshot is
 * converted once at module scope (top-level await) — rendering then only does pure work and
 * the image routes stay statically prerendered under `cacheComponents`.
 */
import { join } from "node:path";
import sharp from "sharp";
import { projects } from "@/lib/content";
import { SHOT as SCREENSHOT_SIZE } from "./render";

async function toPngDataUrl(publicPath: string): Promise<string> {
  const png = await sharp(join(process.cwd(), "public", publicPath.replace(/^\//, "")))
    .resize({ width: SCREENSHOT_SIZE.width * 2, height: SCREENSHOT_SIZE.height * 2, fit: "cover", position: "top" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** slug → PNG data URL of the project's desktop screenshot. */
export const PROJECT_SCREENSHOTS: Record<string, string> = Object.fromEntries(
  await Promise.all(projects.map(async (p) => [p.slug, await toPngDataUrl(p.images.desktop)] as const)),
);
