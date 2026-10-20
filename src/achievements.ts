import type { State } from "./model";
import { TOPICS, topicProgress } from "./topics";
export type BadgeCategory = "rhythm" | "knowledge" | "secret";
export const BADGES = [
  { id: "aa-first", category: "knowledge" as const, icon: "algebra", zh: "AA · 第一声和弦", en: "AA · First chord", target: 1, metric: "aa" },
  { id: "aa-subgroups", category: "knowledge" as const, icon: "network", zh: "AA · 双重奏", en: "AA · Duet", target: 2, metric: "aa" },
  ...TOPICS.map(t => ({id: t.id === "abstract-algebra" ? "aa-introduction" : `topic-${t.id}`, category: "knowledge" as const, icon: t.id === "abstract-algebra" ? "algebra" : "book", zh: t.id === "abstract-algebra" ? "AA · 入门三讲" : `${t.zh} · 入门完成`, en: t.id === "abstract-algebra" ? "AA · Three-lesson introduction" : `${t.en} · Introduction complete`, target: t.lessons.length, metric: t.id})),
  ...[1,10,30,100].map(n => ({ id: `days-${n}`, category: "rhythm" as const, icon: "flame", zh: `${n} 天探索`, en: `${n} active days`, target: n, metric: "days" })),
  ...[60,600,6000].map(n => ({ id: `time-${n}`, category: "rhythm" as const, icon: "clock", zh: `${n / 60} 小时专注`, en: `${n / 60} focused hours`, target: n * 60, metric: "seconds" })),
  ...[1,5,8].map(n => ({ id: `read-${n}`, category: "knowledge" as const, icon: "book", zh: `读完 ${n} 篇`, en: `${n} articles read`, target: n, metric: "read" })),
  { id: "notes-3", category: "knowledge" as const, icon: "pen", zh: "留下思考", en: "Thought keeper", target: 3, metric: "notes" },
  { id: "links-3", category: "knowledge" as const, icon: "network", zh: "连接者", en: "Connector", target: 3, metric: "links" },
  { id: "saved-5", category: "knowledge" as const, icon: "bookmark", zh: "私人书架", en: "Personal shelf", target: 5, metric: "saved" },
  { id: "rickroll", category: "secret" as const, icon: "music", zh: "Never Gonna Give You Up", en: "Never Gonna Give You Up", target: 1, metric: "rickroll" },
];
export function badgeProgress(state: State, today: string) {
  const activity = Object.entries(state.seconds).filter(([date]) => date <= today);
  const metrics: Record<string, number> = {
    days: activity.filter(([,seconds]) => seconds >= 60).length,
    seconds: activity.reduce((n,[,seconds]) => n + seconds, 0),
    read: Object.values(state.progress).filter(p => p.complete).length,
    notes: Object.values(state.notes).filter(n => n.trim()).length,
    links: state.edges.length, saved: state.saved.length,
    rickroll: state.unlocked?.includes("rickroll") ? 1 : 0,
    aa: topicProgress(TOPICS[0], state).completed,
    ...Object.fromEntries(TOPICS.map(t => [t.id,topicProgress(t,state).completed])),
  };
  return BADGES.map(b => ({ ...b, value: metrics[b.metric], earned: metrics[b.metric] >= b.target }));
}
