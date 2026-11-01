import { adminRoute } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { toCsv } from "@/lib/admin/requests/pure";
import { getInsforgeAdmin } from "@/lib/insforge-admin";

/** CSV of email_optouts (email, created_at, source). */
export const GET = adminRoute(async ({ admin }) => {
  const { data, error } = await getInsforgeAdmin().database.from("email_optouts").select("email,created_at,source").order("created_at", { ascending: true }).limit(50000);
  if (error) return Response.json({ error: "query failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  const rows = (data ?? []) as Array<{ email: string; created_at: string; source: string }>;
  await audit(admin.email, "optout.export", { type: "email_optouts" }, { rows: rows.length });
  return new Response(toCsv(["email", "created_at", "source"], rows.map((r) => [r.email, r.created_at, r.source])), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="email-optouts.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
