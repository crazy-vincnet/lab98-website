import "server-only";

/** InsForge connection for the auth SDK (anon key = public by design; never the admin key). */
export function authConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error("NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY are not set (see .env.example)");
  return { baseUrl, anonKey };
}

/** Comma-separated ADMIN_EMAILS env, lowercased. */
export function envAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const normalizeEmail = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
