import { useState, type ReactNode } from "react";
import { useLanguage } from "./i18n";
import type { State } from "./model";
import { localDate } from "./logic";

export function activityDays(state: State) {
  return Object.entries(state.seconds).filter(([date, seconds]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= localDate() && seconds >= 60).map(([date]) => date).sort();
}
export function Profile({ state, update, cloud = false, children }: { children?: ReactNode; cloud?: boolean; state: State; update: (fn: (s: State) => State) => void }) {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const [editing, setEditing] = useState(false);
  const days = activityDays(state), count = days.length;
  const profile = state.profile;
  const dates = Array.from({ length: 84 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 83 + i); return localDate(d); });
  return <section className="profile-page">
    <div className="profile-heading"><div className={`profile-avatar avatar-${profile.avatar}`} aria-label={c("头像", "Avatar")}>{["◈", "⌘", "∑", "✳"][profile.avatar]}</div><div><span className="eyebrow">{cloud ? "YOUR PROFILE" : "LOCAL PROFILE"}</span><h1>{profile.name || c("探索者", "Explorer")}</h1><p>{profile.bio || c("尚未添加简介", "No bio yet")}</p></div></div>
    <div className="button-row"><button className="secondary" onClick={() => setEditing(!editing)}>{c("编辑资料", "Edit profile")}</button><a className="secondary" href="#/settings">{c("设置", "Settings")} ↗</a></div>
    {children}
    {editing && <div className="settings-section"><label className="field-label">{c("昵称", "Name")}<input maxLength={40} value={profile.name} onChange={e => update(s => ({ ...s, profile: { ...s.profile, name: e.target.value } }))} /></label><label className="field-label">{c("简介", "Bio")}<textarea maxLength={200} value={profile.bio} onChange={e => update(s => ({ ...s, profile: { ...s.profile, bio: e.target.value } }))} /></label><div className="segmented">{["◈", "⌘", "∑", "✳"].map((symbol, i) => <button key={i} aria-label={`${c("头像", "Avatar")} ${i+1}`} aria-pressed={profile.avatar === i} onClick={() => update(s => ({ ...s, profile: { ...s.profile, avatar: i } }))}>{symbol}</button>)}</div><p className="hint">{c("资料自动保存，并随阅读备份导出。", "Profile saves automatically and is included in your reading backup.")}</p></div>}
    <div className="stats-grid"><div><strong>{count}</strong><span>{c("累计活跃天数", "Active days")}</span></div><div><strong>{Object.values(state.progress).filter(p => p.complete).length}</strong><span>{c("完成文章", "Articles completed")}</span></div><div><strong>{state.saved.length}</strong><span>{c("收藏", "Saved")}</span></div></div>
    <section className="settings-section"><h2>{c("阅读活动", "Reading activity")}</h2><div className="activity-grid">{dates.map(date => <span key={date} className={days.includes(date) ? "active" : ""} title={`${date}: ${Math.floor((state.seconds[date] ?? 0)/60)} min`} aria-label={`${date}: ${Math.floor((state.seconds[date] ?? 0)/60)} min`} />)}</div><p className="hint">{c("最近 84 天 · 当天累计阅读 / 图谱活动满 1 分钟计为活跃，不要求连续。", "Last 84 days · at least one minute of reading / graph activity counts as an active day; no streak required.")}</p></section>
    <section className="settings-section"><h2>{c("成就", "Achievements")}</h2><div className="achievement-grid">{[1,10,30,100].map(target => <div className={count >= target ? "achievement unlocked" : "achievement"} key={target}><span className="achievement-seal">{count >= target ? "✦" : "◇"}</span><strong>{target} {c("天", "days")}</strong><span>{count >= target ? c("已达成", "Unlocked") : `${count} / ${target}`}</span><progress value={Math.min(count,target)} max={target} aria-label={`${target} ${c("天成就", "day achievement")}`} /></div>)}</div></section>
  </section>;
}
