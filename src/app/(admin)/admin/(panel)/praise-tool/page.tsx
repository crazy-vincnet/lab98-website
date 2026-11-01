import type { Metadata } from "next";
import { DocList } from "@/components/admin/content/doc-list";
import { requireAdmin } from "@/lib/admin/auth";
import { GROUPS_BY_PAGE } from "@/lib/content-registry";

export const metadata: Metadata = { title: "Praise Tool 페이지" };

export default async function Page() {
  await requireAdmin();
  return <DocList title="Praise Tool 페이지" description="Praise Tool 소개 페이지의 문구를 고쳐요." groups={GROUPS_BY_PAGE["/admin/praise-tool"]} />;
}
