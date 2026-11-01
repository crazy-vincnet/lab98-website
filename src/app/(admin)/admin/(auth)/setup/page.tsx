import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/auth-forms";
import { getAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "최초 설정" };

export default async function SetupPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <>
      <h1 className="mb-4 text-[22px] font-bold">최초 설정</h1>
      <SetupForm />
    </>
  );
}
