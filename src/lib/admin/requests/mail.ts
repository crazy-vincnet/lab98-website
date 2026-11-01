import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SendResult = { ok: true } | { ok: false; error: string; rateLimited: boolean };

/**
 * One email through InsForge (admin key). The sender address is fixed (noreply@…insforge.dev); `from` is a display
 * name only, so `replyTo` must point to a real inbox. InsForge appends its own List-Unsubscribe footer/headers.
 * Never throws. `rateLimited` is true for the hourly send cap ("Rate limit exceeded. Try again in N minutes").
 */
export async function sendMail(o: { to: string; subject: string; html: string; replyTo: string; from: string }): Promise<SendResult> {
  try {
    const { data, error } = await getInsforgeAdmin().emails.send({ to: o.to, subject: o.subject, html: o.html, replyTo: o.replyTo, from: o.from });
    if (error) {
      const msg = String(error.message ?? "send failed");
      return { ok: false, error: msg.slice(0, 300), rateLimited: /rate limit/i.test(msg) };
    }
    const skipped = (data as { skipped?: string[] } | null)?.skipped;
    if (skipped?.length) return { ok: false, error: "받는 주소가 발송 대상에서 제외됐어요 (수신 차단 등).", rateLimited: false };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e instanceof Error ? e.message : "send failed").slice(0, 300), rateLimited: false };
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
