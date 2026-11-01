/**
 * Detect an image's real type and size from its first bytes. The browser-supplied file type and file name are not trusted.
 * Only png, jpg, webp and gif are accepted. SVG is rejected on purpose (it can carry <script>).
 */
export type ImageInfo = { mime: "image/png" | "image/jpeg" | "image/webp" | "image/gif"; ext: "png" | "jpg" | "webp" | "gif"; width: number; height: number };

const u16be = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32be = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

export function readImageInfo(b: Uint8Array): ImageInfo | null {
  // PNG
  if (b.length > 24 && b[0] === 0x89 && ascii(b, 1, 3) === "PNG" && ascii(b, 12, 4) === "IHDR") {
    return { mime: "image/png", ext: "png", width: u32be(b, 16), height: u32be(b, 20) };
  }
  // GIF
  if (b.length > 10 && (ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a")) {
    return { mime: "image/gif", ext: "gif", width: u16le(b, 6), height: u16le(b, 8) };
  }
  // JPEG: walk the segments to the first SOFn marker
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) { o++; continue; }
      const marker = b[o + 1];
      if (marker === 0xff) { o++; continue; }
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { o += 2; continue; }
      const len = u16be(b, o + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { mime: "image/jpeg", ext: "jpg", height: u16be(b, o + 5), width: u16be(b, o + 7) };
      }
      o += 2 + len;
    }
    return null;
  }
  // WEBP (RIFF....WEBP + VP8 / VP8L / VP8X)
  if (b.length > 30 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") {
    const kind = ascii(b, 12, 4);
    if (kind === "VP8 ") return { mime: "image/webp", ext: "webp", width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
    if (kind === "VP8L") {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { mime: "image/webp", ext: "webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (kind === "VP8X") {
      return { mime: "image/webp", ext: "webp", width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1, height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1 };
    }
  }
  return null;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PIXELS = 100_000_000;
