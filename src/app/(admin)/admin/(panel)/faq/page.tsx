import type { Metadata } from "next";
import { DocList } from "@/components/admin/content/doc-list";
import { requireAdmin } from "@/lib/admin/auth";
import { GROUPS_BY_PAGE } from "@/lib/content-registry";

export const metadata: Metadata = { title: "FAQ" };

export default async function Page() {
  await requireAdmin();
  return <DocList title="FAQ" description="자주 묻는 질문과 답변을 고쳐요." groups={GROUPS_BY_PAGE["/admin/faq"]} />;
}
