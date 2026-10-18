import { useEffect, useState, useSyncExternalStore } from "react";
import { auth } from "./auth";
import { passwordError } from "./auth-actions";
import { recoveryState } from "./recovery-state";
import { useLanguage } from "./i18n";

export function EmailLogin() {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false), [cooldown, setCooldown] = useState(0), [message, setMessage] = useState(""), [failed, setFailed] = useState(false);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(cooldown - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);
  const switchMode = (next: typeof mode) => { setMode(next); setPassword(""); setConfirmation(""); setMessage(""); setFailed(false); };
  async function submit(resend = false) {
    if (mode === "register" && !resend && password !== confirmation) { setFailed(true); setMessage(c("两次输入的密码不一致。", "The passwords do not match.")); return; }
    setBusy(true); setMessage(""); setFailed(false);
    try {
      if (resend) {
        await auth.resend(email); setCooldown(60);
        setMessage(c("如果该邮箱需要确认，会收到新的确认邮件。请检查收件箱和垃圾邮件。", "If confirmation is needed, a new email will arrive. Check your inbox and spam folder."));
      } else if (mode === "login") await auth.signIn(email, password);
      else if (mode === "register") {
        const signedIn = await auth.signUp(email, password); setCooldown(60);
        if (!signedIn) setMessage(c("请检查邮箱中的确认邮件；确认后即可用邮箱和密码登录。已有账号可直接登录或找回密码。", "Check your email for confirmation, then sign in with your password. Existing accounts can sign in or reset their password."));
      } else {
        await auth.reset(email); setCooldown(60);
        setMessage(c("如果该邮箱已注册，会收到重设密码邮件。请在发起申请的同一浏览器打开链接。", "If this email has an account, a reset email will arrive. Open its link in the same browser where you made the request."));
      }
    } catch (error) {
      setFailed(true);
      setMessage(passwordError(error && typeof error === "object" && "code" in error ? String(error.code) : "", en));
    } finally { setBusy(false); setPassword(""); setConfirmation(""); }
  }
  return <div className="email-login">
    <div className="auth-tabs" aria-label={c("登录方式", "Account action")}>
      <button type="button" disabled={busy} aria-pressed={mode === "login"} onClick={() => switchMode("login")}>{c("登录", "Sign in")}</button>
      <button type="button" disabled={busy} aria-pressed={mode === "register"} onClick={() => switchMode("register")}>{c("创建账号", "Create account")}</button>
    </div>
    <h3>{mode === "register" ? c("创建你的账号", "Create your account") : mode === "reset" ? c("找回密码", "Reset your password") : c("欢迎回来", "Welcome back")}</h3>
    <form onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="field-label">{c("邮箱", "Email")}<input type="email" autoComplete="email" required value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>
      {mode !== "reset" && <label className="field-label">{c("密码", "Password")}<input type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 8 : undefined} required value={password} disabled={busy} onChange={e => setPassword(e.target.value)} /></label>}
      {mode === "register" && <><p className="hint">{c("至少 8 个字符。", "At least 8 characters.")}</p><label className="field-label">{c("确认密码", "Confirm password")}<input type="password" autoComplete="new-password" minLength={8} required value={confirmation} disabled={busy} onChange={e => setConfirmation(e.target.value)} /></label></>}
      <button className="primary" disabled={busy || (mode !== "login" && cooldown > 0)}>{busy ? c("处理中…", "Please wait…") : mode !== "login" && cooldown ? `${cooldown}s` : mode === "register" ? c("创建账号", "Create account") : mode === "reset" ? c("发送重设密码邮件", "Send password reset email") : c("登录", "Sign in")}</button>
      {mode === "register" && <button type="button" className="text-button" disabled={busy || cooldown > 0 || !email.trim()} onClick={event => { if (event.currentTarget.form?.querySelector<HTMLInputElement>('input[type="email"]')?.reportValidity()) void submit(true); }}>{c("重新发送确认邮件", "Resend confirmation email")}</button>}
    </form>
    {mode !== "register" && <button className="text-button" disabled={busy} onClick={() => switchMode(mode === "reset" ? "login" : "reset")}>{mode === "reset" ? c("返回登录", "Back to sign in") : c("忘记密码？", "Forgot password?")}</button>}
    {message && <p role={failed ? "alert" : "status"}>{message}</p>}
  </div>;
}

export function PasswordSettings() {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const recovery = useSyncExternalStore(recoveryState.subscribe, recoveryState.getSnapshot);
  const [open, setOpen] = useState(false), [password, setPassword] = useState(""), [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [failed, setFailed] = useState(false);
  if (!open && !recovery) return <><button className="text-button" onClick={() => { setOpen(true); setMessage(""); }}>{c("设置 / 修改密码", "Set / change password")}</button>{message && <p role="status">{message}</p>}</>;
  return <form onSubmit={e => { e.preventDefault(); void (async () => {
    setMessage(""); setFailed(false);
    if (password !== confirmation) { setFailed(true); setMessage(c("两次输入的密码不一致。", "The passwords do not match.")); return; }
    setBusy(true);
    try { await auth.changePassword(password); recoveryState.set(false); setOpen(false); setMessage(c("密码已更新。以后可以用新密码登录。", "Password updated. Use your new password next time.")); }
    catch (error) { setFailed(true); setMessage(passwordError(error && typeof error === "object" && "code" in error ? String(error.code) : "", en)); }
    finally { setBusy(false); setPassword(""); setConfirmation(""); }
  })(); }}>
    <h3>{c("设置新密码", "Set a new password")}</h3>
    <label className="field-label">{c("新密码（至少 8 个字符）", "New password (at least 8 characters)")}<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /></label>
    <label className="field-label">{c("确认新密码", "Confirm new password")}<input type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} /></label>
    <button className="primary" disabled={busy}>{busy ? c("保存中…", "Saving…") : c("保存新密码", "Save new password")}</button>
    <button type="button" className="text-button" disabled={busy} onClick={() => { setOpen(false); recoveryState.set(false); setPassword(""); setConfirmation(""); setMessage(""); }}>{c("取消", "Cancel")}</button>
    {message && <p role={failed ? "alert" : "status"}>{message}</p>}
  </form>;
}
