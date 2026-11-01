import type { Metadata } from "next";
import { Card } from "@/components/admin/card";
import { NewPostForm } from "@/components/admin/blog/new-post-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "새 글" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="새 글" description="제목만 정하면 초안이 만들어져요. 나머지는 편집 화면에서 채워요." />
      <Card>
        <NewPostForm />
      </Card>
    </>
  );
}
