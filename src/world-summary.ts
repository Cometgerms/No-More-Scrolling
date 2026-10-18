import { parseFeed, type WorldFeed, type WorldEvent } from "./world-data";
import { requestAnswer, type ChatConfig } from "./chat";
export type Brief = { id: string; summary: string; significance: string; category: "diplomacy" | "policy" | "other" };
export const HISTORY_KEY = "nms-world-history-v1";
export const SUMMARY_ENDPOINT = "nms-summary-endpoint-v1";
export const SUMMARY_MODE = "nms-summary-mode-v1";
export async function summarizeWithAI(config: ChatConfig, events: WorldEvent[], language: string, signal: AbortSignal, request: typeof fetch = fetch) {
  const text = await requestAnswer(config, [{ role: "user", content: 'Summarize the supplied reports, focusing on diplomacy and public policy. Use only supplied evidence; headlines do not establish full article details. Separate reported developments from possible implications. Return only JSON: {"summaries":[{"id":"source id","summary":"reported facts","significance":"qualified analysis","category":"diplomacy or policy or other"}]}. Include each report ID once.' }], { id: "world-summary", title: "Source reports", text: JSON.stringify(events) }, language, signal, request);
  return parseBriefs(JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")), events);
}
export function topic(event: WorldEvent): Brief["category"] {
  if (/diplomat|sanction|treaty|summit|ceasefire|negotiat|ambassador|foreign minister|nato|united nations/i.test(event.title)) return "diplomacy";
  if (/policy|government|election|parliament|tariff|legislat|reform|president|minister|protest|law\b/i.test(event.title)) return "policy";
  return "other";
}
export function archiveFeed(history: WorldFeed[], next: WorldFeed) {
  const day = next.fetchedAt.slice(0,10);
  return [...history.filter(f => f.fetchedAt.slice(0,10) !== day), next].sort((a,b) => Date.parse(b.fetchedAt)-Date.parse(a.fetchedAt)).slice(0,30);
}
export function readHistory(): WorldFeed[] {
  try { const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); return Array.isArray(raw) ? raw.slice(0,30).flatMap(f => { try { return [parseFeed(f)]; } catch { return []; } }) : []; } catch { return []; }
}
export function summaryEndpoint(value: string) {
  const u = new URL(value);
  if ((u.protocol !== "https:" && !(u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname))) || u.username || u.password || u.hash || u.search) throw new Error("endpoint");
  return u.href;
}
export function parseBriefs(value: unknown, events: WorldEvent[]): Brief[] {
  const list = (value as { summaries?: unknown })?.summaries;
  if (!Array.isArray(list) || list.length > events.length) throw new Error("Invalid summaries");
  const seen = new Set<string>();
  return list.map(b => {
    if (!b || !events.some(e => e.id === b.id) || seen.has(b.id) || !["diplomacy","policy","other"].includes(b.category) || ![b.summary,b.significance].every(t => typeof t === "string" && t.trim().length > 0 && t.length < 5000)) throw new Error("Invalid summary");
    seen.add(b.id); return { id: b.id, summary: b.summary, significance: b.significance, category: b.category };
  });
}
export async function summarize(endpoint: string, events: WorldEvent[], language: string, signal: AbortSignal, request: typeof fetch = fetch) {
  const response = await request(summaryEndpoint(endpoint), { method: "POST", headers: { "Content-Type": "application/json" }, redirect: "error", credentials: "omit", signal,
    body: JSON.stringify({ version: 1, language, focus: "international diplomacy and public policy", instructions: "Summarize only the supplied evidence. Separate reported facts from implications. Never invent full-article details from headlines. Return summaries with id, summary, significance, category (diplomacy/policy/other).", events }) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text(); if (text.length > 100000) throw new Error("Response too large");
  return parseBriefs(JSON.parse(text), events);
}
