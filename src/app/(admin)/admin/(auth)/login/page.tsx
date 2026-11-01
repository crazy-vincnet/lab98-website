import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/auth-forms";
import { FlashFromUrl } from "@/components/admin/flash";
import { getAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <>
      <h1 className="mb-4 text-[22px] font-bold">로그인</h1>
      <LoginForm />
      <FlashFromUrl />
    </>
  );
}
