import { useEffect, useRef, useState } from "react";
import { useAI } from "./Assistant";
import { useLanguage } from "./i18n";
import { RichText } from "./Math";
import { parseFeed, regions, type WorldFeed, type WorldEvent } from "./world-data";
import { generateAnalysis, parseAnalysis, parseAnalysisArchive, type AnalysisArchive, type GlobalAnalysis } from "./world-analysis";
type LocalEdition = { generatedAt: string; feedAt: string; events: WorldEvent[]; analysis: GlobalAnalysis };
const regionNames = {global:["全球 / 未分类","Global / unclassified"],americas:["美洲","Americas"],europe:["欧洲","Europe"],africa:["非洲","Africa"],asia:["亚太","Asia Pacific"],"middle-east":["中东","Middle East"]};

export function Coverage({ events }: { events: WorldEvent[] }) {
  const { language }=useLanguage(), en=language==="en";
  const sources=[...new Set(events.map(e=>e.source))];
  return <div className="coverage-grid"><section><h3>{en ? "Regional coverage" : "报道地区分布"}</h3>{regions.map(r=>{ const count=events.filter(e=>e.region===r).length; return <div className="coverage-row" key={r}><span>{regionNames[r][en?1:0]}</span><progress max={Math.max(1,events.length)} value={count} aria-label={`${regionNames[r][en?1:0]}: ${count}`} /><strong>{count}</strong></div>; })}</section><section><h3>{en ? "Sources in this snapshot" : "本期来源构成"}</h3>{sources.map(s=>{const count=events.filter(e=>e.source===s).length; return <div className="coverage-row" key={s}><span>{s}</span><progress max={Math.max(1,events.length)} value={count} aria-label={`${s}: ${count}`} /><strong>{count}</strong></div>; })}<p className="hint">{en ? "Counts measure coverage, not danger or consensus. Several reports may describe the same event; regions are inferred from headlines." : "数量表示报道覆盖，不是风险或共识。多篇报道可能指向同一事件；地区按标题粗略分类。"}</p></section></div>;
}
export function AnalysisArticle({ analysis, events }: { analysis: GlobalAnalysis; events: WorldEvent[] }) {
  const {language}=useLanguage(), en=language==="en";
  return <article className="global-article"><h2>{analysis.title}</h2><p className="analysis-lead"><RichText value={analysis.introduction}/></p>{analysis.sections.map((s,i)=><section key={i}><span className="eyebrow">{String(i+1).padStart(2,"0")}</span><h3>{s.heading}</h3><p><strong>{en?"Reported · ":"报道事实 · "}</strong><RichText value={s.facts}/></p><p><strong>{en?"Interpretation · ":"可能影响 · "}</strong><RichText value={s.interpretation}/></p><ul className="analysis-sources">{s.sourceIds.map(id=>{const e=events.find(e=>e.id===id)!;return <li key={id}><a href={e.url} target="_blank" rel="noreferrer">{e.source} · {e.title} ↗</a></li>;})}</ul></section>)}<section><h3>{en?"What to watch next":"接下来观察什么"}</h3><ul>{analysis.watch.map((item,i)=><li key={i}><RichText value={item}/></li>)}</ul></section><aside className="callout"><strong>{en?"Evidence & limitations":"证据与局限"}</strong><p>{analysis.limitations}</p></aside></article>;
}
export function WorldAnalysis({feed}:{feed:WorldFeed}) {
  const {language}=useLanguage(), en=language==="en", {config}=useAI();
  const [archive,setArchive]=useState<AnalysisArchive|null>(() => { try {return parseAnalysisArchive(JSON.parse(localStorage.getItem("nms-published-analysis-v1") ?? "null"));} catch {return null;} }),[selected,setSelected]=useState(""),[local,setLocal]=useState<LocalEdition|null>(null);
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[archiveFailed,setArchiveFailed]=useState(false);
  const controller=useRef<AbortController|null>(null), key=`nms-global-analysis-${language}-${feed.fetchedAt}`;
  useEffect(()=>{
    const abort=new AbortController();
    void (async()=>{try {const r=await fetch(`${import.meta.env.BASE_URL}world-analysis.json`,{cache:"no-store",signal:abort.signal}); if(!r.ok)throw Error(); const body=await r.text();if(body.length>4_000_000)throw Error();const value=parseAnalysisArchive(JSON.parse(body));if(!abort.signal.aborted){setArchive(value);setArchiveFailed(false);try{localStorage.setItem("nms-published-analysis-v1",JSON.stringify(value));}catch{/* Reading remains available. */}}}catch{if(!abort.signal.aborted)setArchiveFailed(true);}})();
    return ()=>abort.abort();
  },[feed.fetchedAt]);
  useEffect(()=>{
    setLocal(null);setNotice("");setBusy(false);
    try {const raw=JSON.parse(localStorage.getItem(key)??"null");const f=parseFeed({version:1,fetchedAt:raw.feedAt,events:raw.events});if(typeof raw.generatedAt!=="string" || !Number.isFinite(Date.parse(raw.generatedAt)))throw Error();setLocal({generatedAt:raw.generatedAt,feedAt:f.fetchedAt,events:f.events,analysis:parseAnalysis(raw.analysis,f.events)});}catch{ /* No cached personal draft. */ }
    return ()=>{controller.current?.abort();controller.current=null;};
  },[key]);
  async function generate() {
    if(!config.key){setNotice(en?"Configure the shared AI API in Settings first.":"请先在设置填写共用 AI API。");return;}
    const abort=new AbortController();controller.current=abort;setBusy(true);setNotice("");const timeout=setTimeout(()=>abort.abort(),90000);
    try {const analysis=await generateAnalysis(config,feed,language,abort.signal);if(abort.signal.aborted)return;const edition={generatedAt:new Date().toISOString(),feedAt:feed.fetchedAt,events:feed.events,analysis};setLocal(edition);setSelected("personal");try {const keys=Object.keys(localStorage).filter(k=>k.startsWith("nms-global-analysis-"));for(const old of keys.slice(0,Math.max(0,keys.length-29)))localStorage.removeItem(old);localStorage.setItem(key,JSON.stringify(edition));}catch{setNotice(en?"Generated; local saving unavailable.":"已生成，但本地保存失败。");}}
    catch{if(controller.current===abort)setNotice(en?"Generation stopped or failed. Check the shared API configuration and try again.":"生成已停止或失败，请检查共用 API 配置后重试。");}
    finally{clearTimeout(timeout);if(controller.current===abort)setBusy(false);}
  }
  const edition=archive?.editions.find(e=>e.generatedAt===selected)??archive?.editions[0];
  const useLocal=local && (selected==="personal" || !edition);
  const analysis=useLocal?local.analysis:edition?.[language], events=useLocal?local.events:edition?.events??feed.events;
  const stamp=useLocal?local.generatedAt:edition?.generatedAt, feedAt=useLocal?local.feedAt:edition?.feedAt??feed.fetchedAt;
  return <section className="global-analysis"><div className="section-heading"><div><span className="eyebrow">DAILY GLOBAL OUTLOOK</span><h2>{en?"The world, in perspective":"全球局势 · 每日观察"}</h2></div><button className="primary" disabled={!feed.events.length} onClick={()=>busy?controller.current?.abort():void generate()}>{busy?(en?"Stop":"停止"):(en?"Generate global analysis":"生成全局分析")}</button></div>
    <p className="hint">{en?"Daily analysis uses the full snapshot, independent of the filters below. Personal generation sends these headlines to your configured AI provider.":"每日分析使用完整来源快照，不受下方筛选影响。手动生成会把这些报道标题发送给你配置的 AI 服务。"}</p>
    {(edition || local) && <label className="field-label">{en?"Analysis edition":"分析日期"}<select value={useLocal?"personal":edition?.generatedAt??""} onChange={e=>setSelected(e.target.value)}>{local&&<option value="personal">{en?"My generated analysis":"我生成的分析"}</option>}{archive?.editions.map(e=><option key={e.generatedAt} value={e.generatedAt}>{e.generatedAt.slice(0,10)} UTC</option>)}</select></label>}
    <p className="hint">{en?"Evidence snapshot: ":"证据采集："}{new Date(feedAt).toLocaleString(en?"en-US":"zh-CN")}{stamp&&<> · {en?"AI generated: ":"AI 生成："}{new Date(stamp).toLocaleString(en?"en-US":"zh-CN")}</>}</p>
    <Coverage events={events}/>
    {analysis?<AnalysisArticle analysis={analysis} events={events}/>:<p className="analysis-empty">{en?"No global analysis is available yet. Configure the daily job or generate one with your API above.":"暂时没有全局分析文章。配置每日自动任务后会在这里更新，也可以点击上方按钮用你的 API 生成。"}</p>}
    {archive && archive.status!=="ready"&&<p className="hint">{archive?.status==="failed"?(en?"Latest automatic analysis failed; previous editions remain available.":"最新自动分析失败；已有历史版本仍可阅读。"):(en?"Automatic analysis awaits the site’s API configuration; news fetching works separately.":"自动分析等待站点 API 配置；多来源新闻抓取可独立运行。")}</p>}
    {archiveFailed && <p className="hint">{en?"Could not refresh the daily analysis; cached editions remain available.":"每日分析暂时无法刷新，保留已缓存的版本。"}</p>}
    {notice&&<p role="status">{notice} <a href="#/settings">{en?"Settings ↗":"设置 ↗"}</a></p>}
  </section>;
}
