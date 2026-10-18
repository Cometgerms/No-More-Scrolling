import { useState } from "react";
import { useLanguage } from "./i18n";
import { SUMMARY_ENDPOINT, SUMMARY_MODE, summaryEndpoint } from "./world-summary";
export const EDGE_MODE = "nms-edge-mode-v1";
export function SummarySettings() {
  const { language } = useLanguage(), en = language === "en";
  const read = (key: string, fallback: string) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const [url, setUrl] = useState(() => read(SUMMARY_ENDPOINT, "")), [mode, setMode] = useState(() => read(SUMMARY_MODE, "shared"));
  const [edge, setEdge] = useState(() => read(EDGE_MODE, "manual")), [message, setMessage] = useState("");
  return <section className="settings-section"><h2>{en ? "AI tools" : "AI 工具"}</h2><p>{en ? "One API configuration for chat, world summaries and graph explanations. Generate only when requested; every explanation stays editable." : "聊天、世界摘要和关联说明共用上面的 API 配置。点击生成才会请求，所有关联说明都可以手动编辑。"}</p>
    <form onSubmit={e => { e.preventDefault(); try {
      if (mode === "custom") localStorage.setItem(SUMMARY_ENDPOINT, summaryEndpoint(url.trim()));
      localStorage.setItem(SUMMARY_MODE, mode); localStorage.setItem(EDGE_MODE, edge); setMessage(en ? "Saved" : "已保存");
    } catch { setMessage(en ? "Check the URL or storage permissions." : "请检查地址或存储权限。"); } }}>
    <label className="field-label">{en ? "World summaries" : "世界摘要"}<select value={mode} onChange={e => setMode(e.target.value)}><option value="shared">{en ? "Use shared AI configuration" : "共用 AI 配置"}</option><option value="custom">{en ? "Custom summary server (advanced)" : "独立摘要服务（高级）"}</option></select></label>
    {mode === "custom" && <label className="field-label">{en ? "Summary endpoint" : "摘要接口地址"}<input type="url" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…/summarize" /></label>}
    <label className="field-label">{en ? "Graph explanations" : "图谱关联说明"}<select value={edge} onChange={e => setEdge(e.target.value)}><option value="manual">{en ? "Write manually" : "手动输入"}</option><option value="ai">{en ? "AI draft, then edit" : "API 辅助生成，再手动编辑"}</option></select></label>
    <button className="secondary">{en ? "Save" : "保存"}</button><p role="status">{message}</p></form></section>;
}
