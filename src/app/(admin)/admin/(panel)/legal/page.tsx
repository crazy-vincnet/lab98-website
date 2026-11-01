import type { Metadata } from "next";
import { DocList } from "@/components/admin/content/doc-list";
import { requireAdmin } from "@/lib/admin/auth";
import { GROUPS_BY_PAGE } from "@/lib/content-registry";

export const metadata: Metadata = { title: "법적 문서" };

export default async function Page() {
  await requireAdmin();
  return <DocList title="법적 문서" description="개인정보처리방침, 이용약관, 쿠키 안내의 문구를 고쳐요." groups={GROUPS_BY_PAGE["/admin/legal"]} />;
}
