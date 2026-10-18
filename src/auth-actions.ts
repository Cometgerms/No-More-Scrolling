import type { SupabaseClient } from "@supabase/supabase-js";

type AuthApi = Pick<SupabaseClient["auth"], "signInWithPassword" | "signUp" | "resend" | "resetPasswordForEmail" | "updateUser">;
/** @ensures Passwords go only to Supabase Auth; this layer never persists credentials. */
export function emailAuth(api: AuthApi, redirect: () => string) {
  return {
    async signIn(email: string, password: string) {
      const { error } = await api.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    async signUp(email: string, password: string) {
      const { data, error } = await api.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirect() } });
      if (error) throw error;
      return !!data.session;
    },
    async resend(email: string) {
      const { error } = await api.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: redirect() } });
      if (error) throw error;
    },
    async reset(email: string) {
      const { error } = await api.resetPasswordForEmail(email.trim(), { redirectTo: redirect() });
      if (error) throw error;
    },
    async changePassword(password: string) {
      const { error } = await api.updateUser({ password });
      if (error) throw error;
    },
  };
}
export function passwordError(code: string, en: boolean) {
  const messages: Record<string, [string, string]> = {
    invalid_credentials: ["邮箱或密码不正确。", "Incorrect email or password."],
    email_not_confirmed: ["请先点击邮箱中的确认链接，再登录。", "Confirm your email before signing in."],
    weak_password: ["密码强度不足，请设置更长、更难猜的密码。", "Choose a longer, stronger password."],
    same_password: ["新密码不能与原密码相同。", "Choose a password different from your current one."],
    otp_expired: ["邮件链接已失效，请重新申请。", "This email link has expired. Request a new one."],
    email_address_not_authorized: ["该邮箱暂不能接收验证邮件，请联系站点管理员配置邮件服务。", "Email delivery is not configured for this address. Contact the site administrator."],
  };
  if (code.includes("rate_limit")) return en ? "Too many requests. Please try again later." : "请求太频繁，请稍后重试。";
  return messages[code]?.[en ? 1 : 0] ?? (en ? "Could not finish. Check your connection and try again." : "操作未完成，请检查网络后重试。");
}
