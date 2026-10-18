import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "../src/i18n";
import { AnalysisArticle, Coverage } from "../src/WorldAnalysis";
import type { WorldEvent } from "../src/world-data";
import "../src/styles.css";
import "katex/dist/katex.min.css";
const events:WorldEvent[]=[{id:"a",title:"示例来源 A · 外交报道",source:"Example A",region:"europe",publishedAt:"2026-01-01T00:00:00Z",url:"https://example.com/a"},{id:"b",title:"示例来源 B · 政策报道",source:"Example B",region:"asia",publishedAt:"2026-01-01T00:00:00Z",url:"https://example.com/b"}];
function Preview(){
  const [light,setLight]=useState(false);
  useEffect(()=>{document.documentElement.dataset.theme=light?"light":"dark";},[light]);
  return <main style={{maxWidth:390,margin:"24px auto",padding:12}}><p className="hint">排版预览 · 示例文字，不是新闻分析或实际 API 输出</p><button className="secondary" onClick={()=>setLight(!light)}>{light?"切换深色":"切换浅色"}</button><section className="global-analysis"><span className="eyebrow">DAILY GLOBAL OUTLOOK</span><Coverage events={events}/><AnalysisArticle events={events} analysis={{title:"把报道事实与可能影响分开阅读",introduction:"这是一篇用于验证手机排版的示例。全局观察会先归纳多个来源的报道，再给出有条件的分析，最后说明证据缺口。",sections:[{heading:"外交：从公开表态到实际行动",facts:"这里呈现来源明确报道的信息，保留报道日期和原始链接。",interpretation:"这里讨论可能的影响，区分已经发生的事情和仍需验证的判断。多个标题提到同一事件，不代表已经独立核实。",sourceIds:["a"]},{heading:"政策：留意执行范围与时间",facts:"摘要只使用现有报道提供的信息，不会根据标题补写细节。",interpretation:"分析会指出适用范围、实施时间与可能的限制，并提示下一步需要查阅的材料。",sourceIds:["b"]}],watch:["查阅正式文件，核对措施的实施日期。","比较后续报道是否提供新的证据。"],limitations:"示例内容仅用于布局测试。正式分析也会明确：来源快照覆盖有限，自动生成的结论需要核对。"}}/></section></main>;
}
createRoot(document.getElementById("root")!).render(<LanguageProvider initialLanguage="zh"><Preview/></LanguageProvider>);
