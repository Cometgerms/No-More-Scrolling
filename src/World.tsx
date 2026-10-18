import { useEffect, useState } from "react";
import { useLanguage } from "./i18n";
import { parseFeed, regions, type Region, type WorldFeed } from "./world-data";

import land from "./world-land.json";
import { WorldAnalysis } from "./WorldAnalysis";
import { NEWS_SOURCES } from "./news-feed";
import { WorldReports } from "./WorldReports";
import { archiveFeed, readHistory, HISTORY_KEY, topic } from "./world-summary";

const names: Record<Region, [string, string]> = { global: ["全球 / 未分类", "Global / unclassified"], americas: ["美洲", "Americas"], europe: ["欧洲", "Europe"], africa: ["非洲", "Africa"], asia: ["亚太", "Asia Pacific"], "middle-east": ["中东", "Middle East"] };
const positions = [[75, 245], [140, 100], [320, 65], [325, 175], [465, 110], [375, 125]];
const CACHE = "nms-world-v1";
export function World() {
  const { language } = useLanguage(), en = language === "en";
  const copy = (zh: string, english: string) => en ? english : zh;
  const [feed, setFeed] = useState<WorldFeed | null>(() => { try { return parseFeed(JSON.parse(localStorage.getItem(CACHE) ?? "null")); } catch { return null; } });
  const [history, setHistory] = useState(readHistory), [date, setDate] = useState("");
  const [focus, setFocus] = useState(true), [archiveError, setArchiveError] = useState(false);
  const [region, setRegion] = useState<Region | "all">("all");
  const [busy, setBusy] = useState(false), [failed, setFailed] = useState(false), [clock, setClock] = useState(Date.now());
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let controller: AbortController | null = null;
    let active = true;
    let running = false;
    async function load() {
      if (running) return;
      running = true; setBusy(true);
      controller = new AbortController();
      const request = controller;
      const timeout = setTimeout(() => request.abort(), 15000);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}world-feed.json`, { cache: "no-store", signal: request.signal });
        if (!response.ok) throw new Error("Feed unavailable");
        const text = await response.text();
        if (text.length > 100000) throw new Error("Feed too large");
        const next = parseFeed(JSON.parse(text));
        if (active && !request.signal.aborted) { setFeed(next); setFailed(false); const saved = archiveFeed(readHistory(), next); setHistory(saved); try { localStorage.setItem(HISTORY_KEY, JSON.stringify(saved)); setArchiveError(false); } catch { setArchiveError(true); } try { localStorage.setItem(CACHE, JSON.stringify(next)); } catch { /* Reading works without persistence. */ } }
      } catch { if (active) setFailed(true); }
      finally { clearTimeout(timeout); running = false; if (active) { setBusy(false); setClock(Date.now()); } }
    }
    void load();
    const timer = setInterval(() => { if (!document.hidden) void load(); }, 5 * 60_000);
    return () => { active = false; controller?.abort(); clearInterval(timer); };
  }, [refresh]);
  const currentFeed = date ? history.find(f => f.fetchedAt.slice(0,10) === date) ?? feed : feed;
  const events = currentFeed?.events.filter(e => (region === "all" || e.region === region) && (!focus || topic(e) !== "other")) ?? [];
  const stale = feed && clock - Date.parse(feed.fetchedAt) > 36 * 3600_000;
  return <section className="world-page" data-chat-context>
    <div className="page-heading"><span className="eyebrow">WORLD BRIEF</span><h1>{copy("世界局势", "World affairs")}</h1><p>{copy("国际外交、公共政策与事件记录。", "Diplomacy, public policy and an evolving record.")}</p></div>
    <div className="world-status"><span>{busy ? copy("正在检查更新…", "Checking for updates…") : failed ? copy("更新失败 · 保留上次数据", "Update failed · showing last data") : stale ? copy("数据已超过 36 小时", "Data is over 36 hours old") : copy("来源快照 · 非实时直播", "Source snapshot · not a live stream")}</span><button className="chip" disabled={busy} onClick={() => setRefresh(n => n + 1)}>{copy("刷新", "Refresh")}</button></div>
    {currentFeed && <p className="hint">{copy("采集时间：", "Fetched: ")}{new Date(currentFeed.fetchedAt).toLocaleString(en ? "en-US" : "zh-CN")}</p>}
    <div className="world-controls"><label>{copy("简报日期", "Edition")}<select value={date} onChange={e => setDate(e.target.value)}><option value="">{copy("最新", "Latest")}</option>{history.map(f => <option key={f.fetchedAt} value={f.fetchedAt.slice(0,10)}>{f.fetchedAt.slice(0,10)} UTC</option>)}</select></label><label className="chat-check"><input type="checkbox" checked={focus} onChange={e => setFocus(e.target.checked)} />{copy("外交 / 政策优先", "Diplomacy / policy only")}</label><button className="secondary" disabled={!history.length} onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, editions: history }, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href=url; a.download="world-history.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>{copy("导出历史", "Export history")}</button></div>
    <p className="hint">{copy("访问时按 UTC 日期保存最近 30 个日期的来源快照；同日保留最新一版。外交 / 政策分类由标题关键词判断。", "Keeps the latest visited snapshot per UTC day, up to 30 dates. Diplomacy / policy filtering uses headline keywords.")}</p>{archiveError && <p role="status">{copy("本地历史保存失败，请导出当前记录。", "History could not be saved locally. Export your record.")}</p>}
    {currentFeed && <WorldAnalysis feed={currentFeed} />}
    <div className="world-atlas"><div className="section-heading"><h2>{copy("报道坐标", "Report atlas")}</h2><span className="eyebrow">REGIONAL LENS</span></div>
      <svg viewBox="0 0 600 300" role="group" aria-label={copy("世界陆地地图，可点击区域筛选；不显示国界", "World land map; select a region, no national borders")}>
        <defs><pattern id="atlas-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="currentColor" opacity=".14" /></pattern></defs><rect width="600" height="300" fill="url(#atlas-grid)" rx="12" />
        <g className="world-land">{land.map((d,i) => <path key={i} d={d} />)}</g>
        {regions.map((r, i) => { const count = currentFeed?.events.filter(e => e.region === r).length ?? 0; const [x,y] = positions[i]; return <g key={r} role="button" tabIndex={0} aria-pressed={region === r} aria-label={`${names[r][en ? 1 : 0]}: ${count}`} onClick={() => setRegion(region === r ? "all" : r)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRegion(region === r ? "all" : r); } }} className={region === r ? "atlas-node selected" : "atlas-node"}><circle cx={x} cy={y} r={15 + count * 1.5} /><text x={x} y={y+6} textAnchor="middle">{count}</text><text className="atlas-label" x={x} y={y+35} textAnchor="middle">{names[r][en ? 1 : 0]}</text></g>; })}
      </svg><p className="hint">{copy("陆地轮廓：Natural Earth（公有领域）。圆圈表示所选日期的报道数，不是风险值；区域为粗略分类。", "Land: Natural Earth (public domain). Circles count reports in this edition, not risk; regions are approximate.")}</p>
    </div>
    <div className="filter-row"><button className={region === "all" ? "chip active" : "chip"} onClick={() => setRegion("all")}>{copy("全部", "All")} · {currentFeed?.events.length ?? 0}</button>{regions.map(r => <button key={r} className={region === r ? "chip active" : "chip"} onClick={() => setRegion(r)}>{names[r][en ? 1 : 0]}</button>)}</div>
    <WorldReports events={events} />
    {!events.length && <div className="empty">{feed ? copy("当前日期或筛选下没有报道，可关闭外交 / 政策筛选。", "No reports match this edition and filter. Try turning off the policy filter.") : copy("暂未取得简报。联网后刷新；部署时会自动采集来源。", "No brief yet. Refresh online; deployment fetches the source feed.")}</div>}
    <aside className="callout"><strong>{copy("如何读这张图？", "How to read this view")}</strong><p>{copy("这是多来源的有限报道快照，不代表完整世界局势或独立事实核查。标题保留原文。每日计划采集一次，调度可能延迟；来源失败时保留可用报道。", "A finite multi-source snapshot, not comprehensive coverage or independent fact-checking. Headlines retain original wording. Fetching is scheduled daily and may be delayed; available publishers are kept if another fails.")}</p><div className="source-links">{NEWS_SOURCES.map(source => <a key={source.name} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗{currentFeed?.sources?.find(s => s.name === source.name)?.ok === false ? copy(" · 本期未取得", " · unavailable this edition") : ""}</a>)}</div></aside>
  </section>;
}

