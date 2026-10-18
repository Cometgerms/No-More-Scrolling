import { useState } from "react";
import { useLibrary } from "./AccountContext";
import { useLanguage } from "./i18n";
import { EmailLogin, PasswordSettings } from "./EmailLogin";
import { supabase } from "./supabase";

export function AccountPanel() {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const { owner, status, conflicts, imported, store, error } = useLibrary();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (e) {
      setMessage(c("操作未完成，请检查网络后重试。", "Could not finish. Check your connection and try again."));
    } finally { setBusy(false); }
  }
  const labels = {
    guest: c("本机访客", "Guest on this device"), pending: c("修改已在本机保存，等待同步", "Changes saved locally; waiting to sync"), syncing: c("正在同步…", "Syncing…"), synced: c("已与云端同步", "Synced with cloud"), error: c("暂未同步，联网后可重试", "Not synced yet; reconnect and retry"), conflict: c("笔记有不同版本，请选择后同步", "Choose a note version to finish syncing"),
  };
  return <section className="settings-section account-panel" aria-label={c("账号与同步", "Account and sync")}>
    <h2>{c("账号与同步", "Account and sync")}</h2>
    <p role="status">{labels[status]}</p>
    {owner ? <>
      <p className="account-email">{owner.email ?? owner.id}</p>
      <div className="button-row"><button className="secondary" disabled={busy || status === "syncing"} onClick={() => void store.sync()}>{c("立即同步", "Sync now")}</button><button className="text-button" disabled={busy} onClick={() => void run(async () => {
        if (!await store.persist()) throw Error("save");
        if (status !== "synced" && !confirm(c("还有未同步内容，会保存在此账号的本机副本中，下次登录后继续同步。确认退出？", "Unsynced changes will stay in this account's local copy until you sign in again. Sign out?"))) return;
        const { error } = await supabase.auth.signOut({ scope: "local" }); if (error) throw error;
      })}>{c("退出登录", "Sign out")}</button></div>
      <PasswordSettings />
      {!imported && <div className="account-import"><p>{c("是否把这台设备的访客收藏、笔记和阅读记录合并到当前账号？原本的访客副本仍会保留。", "Merge this device's guest bookmarks, notes and reading history into this account? The guest copy will remain on this device.")}</p><button className="secondary" disabled={busy || status === "syncing" || conflicts.length > 0} onClick={() => void run(() => store.importGuest())}>{c("合并本机记录", "Merge device records")}</button></div>}
      {conflicts.map(conflict => <div className="note-conflict" key={conflict.id}><h3>{c("笔记冲突", "Note conflict")} · {conflict.id}</h3><p>{c("本机版本", "This device")}</p><pre>{conflict.local ?? c("已删除", "Deleted")}</pre><p>{c("另一版本", "Other version")}</p><pre>{conflict.remote ?? c("已删除", "Deleted")}</pre><div className="button-row"><button className="secondary" onClick={() => store.resolve(conflict.id, conflict.local)}>{c("用本机版本", "Use this device")}</button><button className="secondary" onClick={() => store.resolve(conflict.id, conflict.remote)}>{c("用另一版本", "Use other version")}</button>{(conflict.local?.length ?? 0) + (conflict.remote?.length ?? 0) + 7 <= 20000 && <button className="secondary" onClick={() => store.resolve(conflict.id, [conflict.local, conflict.remote].filter(v => v !== undefined).join("\n\n---\n\n"))}>{c("保留两份文字", "Keep both texts")}</button>}</div></div>)}
      <p className="hint">{c("收藏、笔记、阅读进度、资料和偏好同步到你的账号。AI 密钥、聊天和世界报告历史仍仅保留在设备上。", "Bookmarks, notes, reading progress, profile and preferences sync to your account. AI keys, chats and world-report history stay on your device.")}</p>
    </> : <>
      <p>{c("登录后可在其他设备继续阅读。首次登录后可选择合并本机记录。", "Sign in to continue on other devices. You can choose to merge this device's records after signing in.")}</p>
      <EmailLogin />
    </>}
    {error === "save" && <p role="alert">{c("本机存储失败，请先导出备份。", "Local storage failed. Export a backup first.")}</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
