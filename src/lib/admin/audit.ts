import "server-only";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

/**
 * Append to audit_log. Never throws (a failed log must not break the action) but logs to stderr.
 * Do not put secrets or full message bodies in `meta`.
 */
export async function audit(
  actor: string,
  action: string,
  target?: { type?: string; id?: string } | string | null,
  meta: Record<string, unknown> = {},
) {
  const t = typeof target === "string" ? { id: target } : (target ?? {});
  try {
    const { error } = await getInsforgeAdmin()
      .database.from("audit_log")
      .insert([{ actor_email: actor, action, target_type: t.type ?? null, target_id: t.id ?? null, meta }]);
    if (error) console.error("audit_log insert failed", error.message);
  } catch (e) {
    console.error("audit_log insert failed", e instanceof Error ? e.message : e);
  }
}
