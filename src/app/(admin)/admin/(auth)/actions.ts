"use server";

/**
 * Sign-in related Server Actions. These are the ONLY admin actions that run without requireAdmin()
 * (the caller is, by definition, not signed in yet). They never reveal whether an account exists or is an admin:
 * wrong password, unknown email and non-admin email all produce the same message; setup/reset always advance
 * to the code step. Authorization still happens in requireAdmin() on every page and every other action.
 */

import { redirect } from "next/navigation";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { audit } from "@/lib/admin/audit";
import { getAdmin, isAdminEmail } from "@/lib/admin/auth";
import { EMAIL_RE, normalizeEmail } from "@/lib/admin/env";
import { redirectWithFlash } from "@/lib/admin/flash";
import { getAuthActions, getAuthClient } from "@/lib/admin/insforge";
import { MIN_PASSWORD, type AuthFormState } from "@/lib/admin/auth-state";
import { checkThrottle, recordAttempt, THROTTLE_MESSAGE } from "@/lib/admin/throttle";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
const BAD_LOGIN = "이메일이나 비밀번호가 맞지 않아요.";
const BAD_CODE = "코드가 맞지 않거나 만료됐어요. 다시 확인해 주세요.";

function checkPasswords(password: string, confirm: string): AuthFormState["fieldErrors"] | null {
  if (password.length < MIN_PASSWORD) return { password: `비밀번호는 ${MIN_PASSWORD}자 이상이어야 해요.` };
  if (password.length > 128) return { password: "비밀번호가 너무 길어요." };
  if (password !== confirm) return { confirm: "비밀번호가 서로 달라요." };
  return null;
}

/** Signed-in AND authorized, or throw the same generic error. Signs out anyone who is not an admin. */
async function ensureAdminSession(): Promise<boolean> {
  if (await getAdmin()) return true;
  try {
    await (await getAuthActions()).signOut();
  } catch {
    /* ignore */
  }
  return false;
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(str(formData, "email"));
  const password = str(formData, "password");
  if (!EMAIL_RE.test(email) || !password) return { error: BAD_LOGIN };

  const t = await checkThrottle("login", email);
  if (t.blocked) return { error: THROTTLE_MESSAGE };

  const auth = await getAuthActions();
  const { data, error } = await auth.signInWithPassword({ email, password });
  let ok = !error && !!data?.user;
  if (ok) {
    // Open signup means any account can sign in; only admins may stay signed in.
    const user = data!.user;
    ok = user.emailVerified === true && (await isAdminEmail(user.email));
    if (!ok) await auth.signOut().catch(() => undefined);
  }
  await recordAttempt("login", t, ok);
  if (!ok) return { email, error: BAD_LOGIN };

  await audit(email, "auth.login", { type: "admin", id: email });
  redirect("/admin");
}

export async function signOutAction() {
  const admin = await getAdmin();
  try {
    await (await getAuthActions()).signOut();
  } catch {
    /* cookies are cleared by the helper either way */
  }
  if (admin) await audit(admin.email, "auth.logout");
  redirect("/admin/login");
}

/** Setup step 1: admin email + new password -> sign up and send the verification code. */
export async function setupStartAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(str(formData, "email"));
  const password = str(formData, "password");
  const confirm = str(formData, "confirm");
  if (!EMAIL_RE.test(email)) return { fieldErrors: { email: "이메일 형식이 맞지 않아요." } };
  const pw = checkPasswords(password, confirm);
  if (pw) return { email, fieldErrors: pw };

  const t = await checkThrottle("setup", email);
  if (t.blocked) return { email, error: THROTTLE_MESSAGE };
  await recordAttempt("setup", t, false); // every start sends mail, so every start counts

  if (await isAdminEmail(email)) {
    try {
      // Remove an unverified pre-registration of this address (open signup), then register with OUR password.
      await getInsforgeAdmin().database.rpc("admin_purge_unverified_user", { p_email: email });
      const { error } = await (await getAuthActions()).signUp({ email, password, name: "관리자" });
      if (error) console.error("admin setup signUp failed:", error.statusCode, error.error);
    } catch (e) {
      console.error("admin setup failed:", e instanceof Error ? e.message : e);
    }
  }
  // Same answer for every address.
  return { step: "code", email, notice: "인증 코드를 메일로 보냈어요. 도착하지 않으면 스팸함을 확인해 주세요." };
}

/** Setup step 2: the emailed code. Signs the admin in on success. */
export async function setupVerifyAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(str(formData, "email"));
  const code = str(formData, "code").replace(/\s+/g, "");
  if (!EMAIL_RE.test(email) || !/^[A-Za-z0-9]{4,12}$/.test(code)) return { step: "code", email, fieldErrors: { code: "코드를 확인해 주세요." } };

  const t = await checkThrottle("login", email);
  if (t.blocked) return { step: "code", email, error: THROTTLE_MESSAGE };

  const { data, error } = await (await getAuthActions()).verifyEmail({ email, otp: code });
  let ok = !error && !!data?.user && (await isAdminEmail(data.user.email));
  await recordAttempt("login", t, ok);
  if (!ok) return { step: "code", email, error: BAD_CODE };

  await audit(email, "auth.setup", { type: "admin", id: email });
  ok = !!(await ensureAdminSession());
  if (!ok) redirectWithFlash("/admin/login", "ok", "이메일 인증이 끝났어요. 로그인해 주세요.");
  redirect("/admin");
}

/** Forgot password step 1: send the reset code (always answers the same). */
export async function forgotStartAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(str(formData, "email"));
  if (!EMAIL_RE.test(email)) return { fieldErrors: { email: "이메일 형식이 맞지 않아요." } };

  const t = await checkThrottle("reset", email);
  if (t.blocked) return { email, error: THROTTLE_MESSAGE };
  await recordAttempt("reset", t, false);

  if (await isAdminEmail(email)) {
    try {
      await (await getAuthClient()).auth.sendResetPasswordEmail({ email });
    } catch (e) {
      console.error("sendResetPasswordEmail failed:", e instanceof Error ? e.message : e);
    }
  }
  return { step: "code", email, notice: "관리자 이메일이 맞다면 재설정 코드를 보냈어요. 스팸함도 확인해 주세요." };
}

/** Forgot password step 2: code + new password. */
export async function resetPasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(str(formData, "email"));
  const code = str(formData, "code").replace(/\s+/g, "");
  const password = str(formData, "password");
  const confirm = str(formData, "confirm");
  if (!EMAIL_RE.test(email) || !/^[A-Za-z0-9]{4,12}$/.test(code)) return { step: "code", email, fieldErrors: { code: "코드를 확인해 주세요." } };
  const pw = checkPasswords(password, confirm);
  if (pw) return { step: "code", email, fieldErrors: pw };

  const t = await checkThrottle("login", email);
  if (t.blocked) return { step: "code", email, error: THROTTLE_MESSAGE };

  let ok = false;
  if (await isAdminEmail(email)) {
    const client = await getAuthClient();
    const ex = await client.auth.exchangeResetPasswordToken({ email, code });
    if (!ex.error && ex.data?.token) {
      const res = await client.auth.resetPassword({ newPassword: password, otp: ex.data.token });
      ok = !res.error;
    }
  }
  await recordAttempt("login", t, ok);
  if (!ok) return { step: "code", email, error: BAD_CODE };

  await audit(email, "auth.password_reset", { type: "admin", id: email });
  redirectWithFlash("/admin/login", "ok", "비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요.");
}
