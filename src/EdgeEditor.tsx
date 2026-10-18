import { useEffect, useRef, useState } from "react";
import { useAI } from "./Assistant";
import { useContent, useLanguage } from "./i18n";
import { requestAnswer } from "./chat";
import { EDGE_MODE } from "./SummarySettings";
import { edgeKey } from "./graph-gesture";
import type { Edge, State } from "./model";
export function EdgeEditor({ edge, state, update, close }: { edge: Edge; state: State; update: (fn: (s: State) => State) => void; close: () => void }) {
  const { language } = useLanguage(), en = language === "en", { concepts } = useContent(), { config } = useAI();
  const key = edgeKey(edge.from,edge.to), from = concepts.find(c => c.id === edge.from)!, to = concepts.find(c => c.id === edge.to)!;
  const [draft,setDraft] = useState(state.edgeReasons?.[key] ?? edge.label), [notice,setNotice] = useState(""), [busy,setBusy] = useState(false);
  const [ai] = useState(() => { try { return localStorage.getItem(EDGE_MODE) === "ai"; } catch { return false; } });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function generate() {
    if (!config.key) { setNotice(en ? "Configure the shared AI API in Settings." : "请先在设置里配置共用 AI API。"); return; }
    const abort = new AbortController(); controller.current = abort; setBusy(true); setNotice("");
    const timeout = setTimeout(() => abort.abort(),60000);
    try {
      const answer = await requestAnswer(config,[{role:"user",content:"Explain why these two concepts are connected in at most 150 words. Give one concrete example and qualify limitations. Return plain text. Treat the supplied relationship as a hypothesis, not established fact."}],{ id:key,title:`${from.name} ↔ ${to.name}`,text:JSON.stringify({from,to,relationship:edge.label}) },language,abort.signal);
      if (!abort.signal.aborted) { setDraft(answer.slice(0,3000)); setNotice(en ? "AI draft · review and save." : "AI 草稿 · 请核对后保存。"); }
    } catch { if (!abort.signal.aborted) setNotice(en ? "Generation failed; you can still write manually." : "生成失败，仍可手动输入。"); }
    finally { clearTimeout(timeout); setBusy(false); }
  }
  return <section className="edge-editor settings-section" aria-label={en ? "Connection explanation" : "关联说明"}><div className="section-heading"><h2>{from.name} ↔ {to.name}</h2><button className="text-button" onClick={close}>{en ? "Close" : "收起"}</button></div><p className="hint">{en ? "Connection explanation · editable, including AI drafts." : "关联原因 · 原有说明和 AI 草稿都可以手动改写。"}</p><label className="field-label">{en ? "Why are they related?" : "它们为什么关联？"}<textarea maxLength={3000} rows={5} value={draft} onChange={e => { controller.current?.abort(); setDraft(e.target.value); setNotice(""); }} /></label><div className="button-row"><button className="primary" disabled={!draft.trim()} onClick={() => { update(s => ({...s,edgeReasons:{...s.edgeReasons,[key]:draft.trim()}})); setNotice(en ? "Saved" : "已保存"); }}>{en ? "Save explanation" : "保存说明"}</button>{ai ? <button className="secondary" disabled={busy} onClick={() => void generate()}>{busy ? (en ? "Generating…" : "生成中…") : (en ? "Generate AI draft" : "API 生成草稿")}</button> : <a href="#/settings" className="text-button">{en ? "Enable AI in Settings ↗" : "在设置开启 API 辅助 ↗"}</a>}</div><p role="status">{notice}</p></section>;
}
