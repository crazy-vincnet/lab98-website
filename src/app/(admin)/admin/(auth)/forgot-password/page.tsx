import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotForm } from "@/components/admin/auth-forms";
import { getAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default async function ForgotPasswordPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <>
      <h1 className="mb-4 text-[22px] font-bold">비밀번호 재설정</h1>
      <ForgotForm />
    </>
  );
}
