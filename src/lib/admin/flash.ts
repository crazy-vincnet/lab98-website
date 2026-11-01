import "server-only";
import { redirect } from "next/navigation";

export type FlashKind = "ok" | "error";

/**
 * One-shot message after a Server Action: redirect(path) with ?flash=ok:text. The panel layout shows it as a
 * toast (components/admin/flash.tsx) and removes it from the URL. Only the text travels; no secrets.
 */
export function redirectWithFlash(path: string, kind: FlashKind, message: string): never {
  const u = new URL(path, "http://x");
  u.searchParams.set("flash", `${kind}:${message.slice(0, 200)}`);
  redirect(`${u.pathname}${u.search}${u.hash}`);
}
