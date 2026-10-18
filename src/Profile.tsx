import { version } from "../package.json";
import { useState, type ReactNode } from "react";
import { useLanguage } from "./i18n";
import type { State } from "./model";
import { badgeProgress, type BadgeCategory } from "./achievements";
import { Avatar, BadgeIcon } from "./ProfileArt";
import { localDate } from "./logic";

export function activityDays(state: State) {
  return Object.entries(state.seconds).filter(([date, seconds]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= localDate() && seconds >= 60).map(([date]) => date).sort();
}
export function Profile({ state, update, cloud = false, children }: { children?: ReactNode; cloud?: boolean; state: State; update: (fn: (s: State) => State) => void }) {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const [editing, setEditing] = useState(false), [category, setCategory] = useState<BadgeCategory | "all">("all");
  const badges = badgeProgress(state, localDate());
  const categories = { rhythm: c("时间与坚持", "Time & rhythm"), knowledge: c("知识积累", "Knowledge"), secret: c("隐藏彩蛋", "Easter eggs") };
  const wear = (id: string) => update(s => { const badge = badges.find(b => b.id === id)!; const kept = (s.profile.badges ?? []).filter(x => badges.find(b => b.id === x)?.category !== badge.category); return { ...s, profile: { ...s.profile, badges: (s.profile.badges ?? []).includes(id) ? kept : [...kept, id] } }; });
  const days = activityDays(state), count = days.length;
  const profile = state.profile;
  const dates = Array.from({ length: 84 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 83 + i); return localDate(d); });
  return <section className="profile-page">
    <div className="profile-heading"><div className={`profile-avatar avatar-${profile.avatar}`} aria-label={c("头像", "Avatar")}><Avatar variant={profile.avatar} /></div><div><span className="eyebrow">{cloud ? "YOUR PROFILE" : "LOCAL PROFILE"} · v{version}</span><h1>{profile.name || c("探索者", "Explorer")}<span className="worn-badges">{badges.filter(b => b.earned && profile.badges?.includes(b.id)).map(b => <span key={b.id} className={`badge-${b.category}`} title={en ? b.en : b.zh} aria-label={en ? b.en : b.zh}><BadgeIcon kind={b.icon} size={22} /></span>)}</span></h1><p>{profile.bio || c("尚未添加简介", "No bio yet")}</p></div></div>
    {!cloud && <a className="primary account-entry" href="#account-access" onClick={e => { e.preventDefault(); document.getElementById("account-access")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{c("登录 / 创建账号 →", "Sign in / Create account →")}</a>}
    <div className="button-row"><button className="secondary" aria-expanded={editing} aria-controls="profile-editor" onClick={() => setEditing(!editing)}>{editing ? c("完成编辑", "Done editing") : c("编辑资料", "Edit profile")}</button><a className="secondary" href="#/settings">{c("设置", "Settings")} ↗</a></div>
    {editing && <div id="profile-editor" className="settings-section"><label className="field-label">{c("昵称", "Name")}<input maxLength={40} value={profile.name} onChange={e => update(s => ({ ...s, profile: { ...s.profile, name: e.target.value } }))} /></label><label className="field-label">{c("简介", "Bio")}<textarea maxLength={200} value={profile.bio} onChange={e => update(s => ({ ...s, profile: { ...s.profile, bio: e.target.value } }))} /></label><div className="segmented">{[0, 1, 2, 3].map((_, i) => <button key={i} aria-label={`${c("头像", "Avatar")} ${i+1}`} aria-pressed={profile.avatar === i} onClick={() => update(s => ({ ...s, profile: { ...s.profile, avatar: i } }))}><Avatar variant={i} /></button>)}</div><p className="hint">{c("资料自动保存，并随阅读备份导出。", "Profile saves automatically and is included in your reading backup.")}</p></div>}
    {children}
    <div className="stats-grid"><div><strong>{count}</strong><span>{c("累计活跃天数", "Active days")}</span></div><div><strong>{Object.values(state.progress).filter(p => p.complete).length}</strong><span>{c("完成文章", "Articles completed")}</span></div><div><strong>{state.saved.length}</strong><span>{c("收藏", "Saved")}</span></div></div>
    <section className="settings-section"><h2>{c("阅读活动", "Reading activity")}</h2><div className="activity-grid">{dates.map(date => <span key={date} className={days.includes(date) ? "active" : ""} title={`${date}: ${Math.floor((state.seconds[date] ?? 0)/60)} min`} aria-label={`${date}: ${Math.floor((state.seconds[date] ?? 0)/60)} min`} />)}</div><p className="hint">{c("最近 84 天 · 当天累计阅读 / 图谱活动满 1 分钟计为活跃，不要求连续。", "Last 84 days · at least one minute of reading / graph activity counts as an active day; no streak required.")}</p></section>
    <section className="settings-section"><h2>{c("成就", "Achievements")}</h2><p className="hint">{c("每类可以佩戴一枚徽章，显示在名字旁边。时间成就按阅读 / 图谱的活跃时间计算。", "Wear one badge per category beside your name. Time badges count active reading / graph time.")}</p>
      <div className="filter-row"><button className={`chip ${category === "all" ? "active" : ""}`} onClick={() => setCategory("all")}>{c("全部", "All")}</button>{Object.entries(categories).map(([id,label]) => <button key={id} className={`chip ${category === id ? "active" : ""}`} onClick={() => setCategory(id as BadgeCategory)}>{label}</button>)}</div>
      <div className="achievement-grid">{badges.filter(b => category === "all" || category === b.category).map(b => <div className={`achievement badge-${b.category} ${b.earned ? "unlocked" : ""}`} key={b.id}><span className="achievement-seal"><BadgeIcon kind={b.icon} size={32} /></span><strong>{en ? b.en : b.zh}</strong><span>{b.earned ? c("已达成", "Unlocked") : b.metric === "seconds" ? `${Math.floor(b.value/60)} / ${b.target/60} min` : `${b.value} / ${b.target}`}</span><progress value={Math.min(b.value,b.target)} max={b.target} aria-label={en ? b.en : b.zh} /><button className="chip" disabled={!b.earned} aria-pressed={profile.badges?.includes(b.id) ?? false} onClick={() => wear(b.id)}>{profile.badges?.includes(b.id) ? c("已佩戴 · 取下", "Wearing · remove") : c("佩戴", "Wear")}</button></div>)}</div></section>
  </section>;
}
