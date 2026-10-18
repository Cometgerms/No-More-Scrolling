import { useState } from "react";
import { useLanguage } from "./i18n";
import { SUMMARY_ENDPOINT, summaryEndpoint } from "./world-summary";
export function SummarySettings() {
  const { language } = useLanguage(), en = language === "en";
  const [url, setUrl] = useState(() => { try { return localStorage.getItem(SUMMARY_ENDPOINT) ?? ""; } catch { return ""; } });
  const [message, setMessage] = useState("");
  return <section className="settings-section"><h2>{en ? "World summary API" : "世界局势摘要 API"}</h2><p>{en ? "Connect your own summary service. Reports are sent only when you choose Generate on the world page." : "连接你自己的摘要服务。在世界页面点击生成后，才会发送该批报道。"}</p><form onSubmit={e => { e.preventDefault(); try { if (url.trim()) localStorage.setItem(SUMMARY_ENDPOINT, summaryEndpoint(url.trim())); else localStorage.removeItem(SUMMARY_ENDPOINT); setMessage(en ? "Saved" : "已保存"); } catch { setMessage(en ? "Check URL or browser storage permissions." : "请检查地址或浏览器存储权限。"); } }}><label className="field-label">{en ? "Summary endpoint" : "摘要接口地址"}<input type="url" placeholder="http://localhost:8787/summarize" value={url} onChange={e => setUrl(e.target.value)} /></label><button className="secondary">{en ? "Save" : "保存"}</button><p role="status">{message}</p></form><p className="hint">{en ? "API keys belong on your server. A phone’s localhost points to the phone; use a reachable HTTPS service for Pages/mobile and allow CORS for your site." : "模型 Key 留在你自己的服务端。手机的 localhost 指向手机本身；Pages／手机使用可访问的 HTTPS 服务，并配置站点 CORS。"}</p></section>;
}
