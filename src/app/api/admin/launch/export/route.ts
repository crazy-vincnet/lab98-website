import { adminRoute } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { toCsv } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

/** CSV of launch_signups (email, org, signed up, consent, notified). Cells that look like formulas are neutralised. */
export const GET = adminRoute(async ({ admin }) => {
  const { data, error } = await getInsforgeAdmin()
    .database.from("launch_signups")
    .select("email,org,created_at,consent_at,notified_at")
    .order("created_at", { ascending: true })
    .limit(20000);
  if (error) return Response.json({ error: "query failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  const rows = (data ?? []) as Array<{ email: string; org: string | null; created_at: string; consent_at: string; notified_at: string | null }>;
  await audit(admin.email, "launch.export", { type: "launch_signups" }, { rows: rows.length });
  const csv = toCsv(["email", "org", "signed_up_at", "consent_at", "notified_at"], rows.map((r) => [r.email, r.org, r.created_at, r.consent_at, r.notified_at]));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="launch-signups.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
