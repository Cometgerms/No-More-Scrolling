import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./i18n";
import { SUMMARY_ENDPOINT, SUMMARY_MODE, parseBriefs, summarize, summarizeWithAI, type Brief } from "./world-summary";
import { useAI } from "./Assistant";
import type { WorldEvent } from "./world-data";
export function WorldReports({ events }: { events: WorldEvent[] }) {
  const { language } = useLanguage(), en = language === "en";
  const { config } = useAI();
  const key = `nms-brief-${language}-${events.map(e => `${e.id}:${e.publishedAt}`).join("|")}`;
  const [briefs, setBriefs] = useState<Brief[]>([]), [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    setBriefs([]); setNotice(""); setBusy(false);
    try { setBriefs(parseBriefs(JSON.parse(localStorage.getItem(key) ?? "null"), events)); } catch { /* Summary is optional. */ }
    return () => { controller.current?.abort(); controller.current = null; };
  }, [key]);
  async function generate() {
    let endpoint = ""; try { if (localStorage.getItem(SUMMARY_MODE) === "custom") endpoint = localStorage.getItem(SUMMARY_ENDPOINT) ?? ""; } catch { /* Report below. */ }
    if (!endpoint && !config.key) { setNotice(en ? "Configure AI in Settings first." : "请先在设置中填写共用的 AI 配置。"); return; }
    const abort = new AbortController(); controller.current = abort; setBusy(true); setNotice("");
    const timeout = setTimeout(() => abort.abort(), 60000);
    try {
      const result = endpoint ? await summarize(endpoint, events, language, abort.signal) : await summarizeWithAI(config, events, language, abort.signal);
      if (abort.signal.aborted) return;
      setBriefs(result);
      try {
        // Bound local AI cache independently of the 30 daily source snapshots.
        const keys = Object.keys(localStorage).filter(k => k.startsWith("nms-brief-"));
        for (const old of keys.slice(0, Math.max(0, keys.length-59))) localStorage.removeItem(old);
        localStorage.setItem(key, JSON.stringify({ summaries: result }));
      } catch { setNotice(en ? "Generated; local saving unavailable." : "已生成，但本地保存不可用。"); }
    } catch { if (!abort.signal.aborted) setNotice(en ? "Summary failed. Check your endpoint, response format, network and CORS. Source reports remain available." : "摘要失败，请检查接口、返回格式、网络与 CORS。原始报道仍可阅读。"); else if (controller.current === abort) setNotice(en ? "Stopped or timed out." : "已停止或超时。"); }
    finally { clearTimeout(timeout); if (controller.current === abort) setBusy(false); }
  }
  return <><div className="section-heading"><h2>{en ? "Diplomacy & policy brief" : "外交与政策简报"}</h2><button className="secondary" disabled={!events.length} onClick={() => busy ? controller.current?.abort() : void generate()}>{busy ? (en ? "Stop" : "停止") : (en ? "Generate summaries" : "生成摘要")}</button></div><p className="hint">{en ? "AI summaries use your configured service. Original links remain attached; headline-only input cannot establish full-article details." : "摘要由你配置的服务生成，保留原始链接；仅有标题时，无法据此补全报道细节。"} <a href="#/settings">{en ? "Settings ↗" : "设置 ↗"}</a></p>{notice && <p role="status">{notice}</p>}
    <div className="world-timeline">{events.map((e,i) => { const b = briefs.find(b => b.id === e.id); return <article className="world-event" key={e.id}><span className="world-index">{String(i+1).padStart(2,"0")}</span><div><span className="eyebrow">{e.source} · {b ? "AI SUMMARY" : "SOURCE REPORT"}</span><h2><a href={e.url} target="_blank" rel="noreferrer">{e.title} ↗</a></h2><time dateTime={e.publishedAt}>{new Date(e.publishedAt).toLocaleString(en ? "en-US" : "zh-CN")}</time>{b ? <div className="report-summary"><h3>{en ? "Reported developments" : "报道要点"}</h3><p>{b.summary}</p><h3>{en ? "Implications · analysis" : "可能影响 · 分析"}</h3><p>{b.significance}</p></div> : <p className="hint">{en ? "Summary not generated. Read the original source or connect your API." : "摘要尚未生成。可先阅读原文，或连接 API 后生成。"}</p>}</div></article>; })}</div>
  </>;
}
