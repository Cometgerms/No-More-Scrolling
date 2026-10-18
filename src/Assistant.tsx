import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle, X, Send, Square } from "lucide-react";
import { useLanguage } from "./i18n";
import { MathText, RichText } from "./Math";
import { requestAnswer, validateChatConfig, type ChatConfig, type ChatMessage, type PageContext } from "./chat";

const empty: ChatConfig = { endpoint: "https://api.openai.com/v1/chat/completions", model: "", key: "" };
const KEY = "nms-chat-session-v1";
const ConfigContext = createContext({ config: empty, save: (_: ChatConfig, _remember: boolean): boolean => false });
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ChatConfig>(() => { try { const value = JSON.parse(sessionStorage.getItem(KEY) ?? "null"); validateChatConfig(value); return value; } catch { return empty; } });
  return <ConfigContext.Provider value={{ config, save: (value, remember) => {
    setConfig(value);
    try { if (remember && value.key) sessionStorage.setItem(KEY, JSON.stringify(value)); else sessionStorage.removeItem(KEY); return true; } catch { return false; }
  } }}>{children}</ConfigContext.Provider>;
}
export function AssistantSettings() {
  const { language } = useLanguage(), en = language === "en";
  const c = (zh: string, english: string) => en ? english : zh;
  const { config, save } = useContext(ConfigContext);
  const [draft, setDraft] = useState(config), [remember, setRemember] = useState(false), [notice, setNotice] = useState("");
  return <section className="settings-section assistant-settings" id="assistant-settings"><h2>{c("AI", "AI")}</h2><p>{c("配置支持 Chat Completions 的服务。发送问题时，所选页面内容和对话会交给下方服务商；可能产生 API 费用。", "Use a Chat Completions compatible service. Sending a question shares the selected page excerpt and conversation with this provider and may incur API charges.")}</p>
    <form onSubmit={e => { e.preventDefault(); try { validateChatConfig(draft); const ok = save(draft, remember); setNotice(ok ? c("已应用。可以打开右下角聊天框。", "Applied. Open the chat corner.") : c("已应用，仅内存可用；浏览器不允许会话存储。", "Applied in memory; session storage unavailable.")); } catch { setNotice(c("请填写有效 HTTPS 接口、模型名称和 API Key。", "Enter a valid HTTPS endpoint, model and API key.")); } }}>
      <label className="field-label">{c("完整 API 地址", "Full API endpoint")}<input type="url" required value={draft.endpoint} onChange={e => setDraft({ ...draft, endpoint: e.target.value })} placeholder="https://…/v1/chat/completions" /></label>
      <label className="field-label">{c("模型名称", "Model name")}<input required value={draft.model} maxLength={200} onChange={e => setDraft({ ...draft, model: e.target.value })} placeholder={c("填写服务商提供的模型 ID", "Model ID from your provider")} /></label>
      <label className="field-label">API Key<input type="password" required autoComplete="off" spellCheck={false} maxLength={2000} value={draft.key} onChange={e => setDraft({ ...draft, key: e.target.value })} /></label>
      <label className="chat-check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />{c("本标签页刷新后保留 Key（sessionStorage）", "Keep key across this tab's reloads (sessionStorage)")}</label>
      <p className="hint">{c("默认只存在内存；不进入备份或 GitHub。会话存储并非加密保险箱，公共设备不要勾选。服务商必须允许浏览器跨域访问；不支持时需要后端代理。", "Memory only by default; excluded from backups and GitHub. Session storage is not an encrypted vault. The provider must allow browser CORS; otherwise a server proxy is needed.")}</p>
      <div className="button-row"><button className="primary" type="submit">{c("应用配置", "Apply")}</button><button type="button" className="secondary" onClick={() => { save(empty, false); setDraft(empty); setRemember(false); setNotice(c("Key 已清除。", "Key cleared.")); }}>{c("清除 Key", "Clear key")}</button></div><p role="status">{notice}</p>
    </form>
    <h3>{c("账号与同步 · 下一步", "Account & sync · next")}</h3><p>{c("Google / 邮箱登录接口已预留。部署后连接云端账号服务，再开启跨设备同步。目前仍是本地使用。", "Google / email auth interfaces are prepared. Connect the cloud account service after deployment to enable cross-device sync. This version still uses local storage.")}</p>
  </section>;
}
function Answer({ text }: { text: string }) {
  return <>{text.split(/(\\\[[\s\S]*?\\\])/g).map((part, i) => part.startsWith("\\[") ? <MathText key={i} value={part.slice(2, -2)} /> : <span key={i}><RichText value={part} /></span>)}</>;
}
export function Assistant({ page }: { page: PageContext }) {
  const { language } = useLanguage(), en = language === "en", { config } = useContext(ConfigContext);
  const c = (zh: string, english: string) => en ? english : zh;
  const [open, setOpen] = useState(false), [input, setInput] = useState(""), [include, setInclude] = useState(true);
  const [messages, setMessages] = useState<(ChatMessage & { page?: string })[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [context, setContext] = useState(page);
  const controller = useRef<AbortController | null>(null), launcher = useRef<HTMLButtonElement>(null), field = useRef<HTMLTextAreaElement>(null), end = useRef<HTMLDivElement>(null);
  // The world view is dynamic. Read only its explicitly marked public content, never forms or notes.
  useEffect(() => {
    const refresh = () => {
      if (page.id === "world") {
        const root = document.querySelector("[data-chat-context]");
        const sources = [...(root?.querySelectorAll("a") ?? [])].map(a => ({ title: a.textContent, url: a.href }));
        setContext({ ...page, text: JSON.stringify({ excerpt: root?.textContent?.slice(0, 10000) ?? "", sources }).slice(0, 14000) });
      }
      else if (page.id.startsWith("read/")) {
        const fragments = [...document.querySelectorAll("[data-chat-fragment]")].map(el => el.textContent ?? "").join("\n");
        setContext({ ...page, text: `${page.text}\nVisible explanation / lab state:\n${fragments}`.slice(0, 14000) });
      } else setContext(page);
    };
    refresh();
    const target = document.querySelector(page.id === "world" ? "[data-chat-context]" : ".reader");
    const observer = new MutationObserver(refresh);
    if (target) observer.observe(target, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [page.id, page.title, page.text]);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy]);
  useEffect(() => () => controller.current?.abort(), []);
  const close = () => { setOpen(false); launcher.current?.focus(); };
  async function send() {
    if (busy || !input.trim()) return;
    const question = input.trim(), snapshot = include ? context : null;
    const next = [...messages, { role: "user" as const, content: question, page: snapshot?.title }];
    setMessages(next); setInput(""); setError(""); setBusy(true);
    const abort = new AbortController(); controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 60000);
    try {
      const answer = await requestAnswer(config, next, snapshot, language, abort.signal);
      if (!abort.signal.aborted) setMessages([...next, { role: "assistant", content: answer, page: snapshot?.title }]);
    } catch (e) {
      setInput(question); setMessages(messages);
      const status = e instanceof Error && /^HTTP \d+$/.test(e.message) ? e.message : "";
      setError(abort.signal.aborted ? c("已停止或请求超时；问题保留，可重试。", "Stopped or timed out; your question is ready to retry.") : `${c("请求失败。检查 Key、模型、余额、网络和服务商 CORS 设置。", "Request failed. Check key, model, credit, network and provider CORS settings.")} ${status}`);
    } finally { clearTimeout(timeout); controller.current = null; setBusy(false); }
  }
  return <><button ref={launcher} className="chat-launcher" aria-label={c("打开 AI", "Open AI")} aria-expanded={open} onClick={() => setOpen(!open)}><MessageCircle size={23} /><span>AI</span></button>
    {open && <section className="chat-panel" role="dialog" aria-modal="false" aria-label={c("AI", "AI")} onKeyDown={e => { if (e.key === "Escape") close(); }}>
      <header><div><span className="eyebrow">CONTEXT CHAT</span><h2>{c("AI", "AI")}</h2></div><button className="icon-button" aria-label={c("关闭聊天", "Close chat")} onClick={close}><X size={20} /></button></header>
      <div className="chat-context"><label className="chat-check"><input type="checkbox" checked={include} onChange={e => setInclude(e.target.checked)} />{c("附带当前页", "Include current page")}</label><strong>{context.title}</strong><details><summary>{c("查看将发送的页面内容", "Preview page excerpt")}</summary><pre>{include ? context.text || c("此页面没有可附带的公开内容。", "No public excerpt on this page.") : c("已关闭。", "Disabled.")}</pre></details></div>
      <div className="chat-messages" role="log" aria-live="polite">{!messages.length && <p className="hint">{c("试试：用一个反例解释这个概念？对这条报道，我还需要什么证据？回答由 AI 生成，请核对关键结论。对话仅在本次打开期间保留。", "Try: explain this concept with a counterexample. What evidence is missing from this report? AI answers need checking. Chats last only for this app session.")}</p>}{messages.map((m,i) => <div key={i} className={`chat-message ${m.role}`}><small>{m.role === "user" ? c("你", "You") : "AI"}{m.page ? ` · ${m.page}` : ""}</small><div><Answer text={m.content} /></div></div>)}{busy && <p>{c("正在思考…", "Thinking…")}</p>}<div ref={end} /></div>
      <div className="chat-compose">{error && <p role="alert" className="hint">{error}</p>}{!config.key ? <p><a href="#/settings" onClick={close}>{c("到设置配置 API ↗", "Configure API in Settings ↗")}</a></p> : <form onSubmit={e => { e.preventDefault(); void send(); }}><textarea ref={field} value={input} disabled={busy} maxLength={4000} rows={2} aria-label={c("你的问题", "Your question")} placeholder={c("哪里还没想通？", "What are you curious about?")} onChange={e => setInput(e.target.value)} /><div className="button-row"><button type="button" disabled={busy || !messages.length} className="secondary" onClick={() => { setMessages([]); setError(""); }}>{c("新对话", "New chat")}</button>{busy ? <button type="button" className="primary" onClick={() => controller.current?.abort()}><Square size={15} />{c("停止", "Stop")}</button> : <button className="primary" disabled={!input.trim()} type="submit"><Send size={16} />{c("发送", "Send")}</button>}</div></form>}</div>
    </section>}
  </>;
}
