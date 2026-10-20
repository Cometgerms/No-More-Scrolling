import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider, useContent, useLanguage } from "../src/i18n";
import { Lab } from "../src/Labs";
import { Graph } from "../src/Graph";
import { initialState, SUBJECTS } from "../src/model";
import "../src/styles.css";
import "katex/dist/katex.min.css";

function Preview() {
  const { articles } = useContent(), { language, setLanguage } = useLanguage();
  const [index,setIndex]=useState(0), [light,setLight]=useState(false), [graph,setGraph]=useState(false), [selected,setSelected]=useState("group");
  const batch=articles.filter(a=>["clockwork-groups","sorting-information-limit","snow-beyond-the-map","states-and-the-future","subgroup-test","cosets-and-lagrange"].includes(a.id)), article=batch[index];
  useEffect(()=>{document.documentElement.dataset.theme=light?"light":"dark";},[light]);
  return <div style={{"--subject":SUBJECTS[article.subject].color,background:"var(--bg)",color:"var(--text)",minHeight:"100vh",padding:16} as React.CSSProperties}>
    <div style={{maxWidth:390,margin:"auto"}}><p className="hint">测试预览 · 不写入阅读记录 / Isolated preview</p>
      <div className="filter-row"><button className="chip" onClick={()=>setLight(!light)}>Light / Dark</button><button className="chip" onClick={()=>setLanguage(language==="zh"?"en":"zh")}>中文 / EN</button><button className="chip" onClick={()=>setGraph(!graph)}>Graph / Lab</button></div>
      <select aria-label="Article" value={index} onChange={e=>setIndex(+e.target.value)} style={{width:"100%",margin:"16px 0"}}>{batch.map((a,i)=><option key={a.id} value={i}>{a.title}</option>)}</select>
      {graph?<Graph state={{...initialState,progress:{[article.id]:{section:3,complete:true}}}} update={()=>{}} open={()=>{}} selected={selected} setSelected={setSelected}/>:<><h1>{article.title}</h1><Lab article={article}/></>}
    </div>
  </div>;
}
createRoot(document.getElementById("root")!).render(<LanguageProvider initialLanguage="zh"><Preview/></LanguageProvider>);
