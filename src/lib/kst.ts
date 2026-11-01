/** Korea Standard Time helpers for the datetime-local inputs (no DST; always UTC+9). Pure arithmetic, safe anywhere. */

/** ISO instant -> "2026-11-01T18:30" (KST wall clock) for <input type="datetime-local">. */
export function toKstLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t + 9 * 3600_000).toISOString().slice(0, 16);
}

/** "2026-11-01T18:30" typed as KST -> ISO instant (UTC), or null if invalid/empty. */
export function fromKstLocalInput(v: string | null | undefined): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}:00+09:00`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
