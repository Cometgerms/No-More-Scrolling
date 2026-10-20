import React, {useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {Topics} from "../src/TopicPage";
import {Reader} from "../src/App";
import {LanguageProvider,useContent} from "../src/i18n";
import {initialState} from "../src/model";
import {topicForArticle} from "../src/topics";
import "../src/styles.css";
import "katex/dist/katex.min.css";
function Preview() {
  const [state,setState]=useState(()=>structuredClone(initialState)), [path,setPath]=useState(location.hash.slice(2)||"topics"), {articles}=useContent();
  useEffect(()=>{const change=()=>{setPath(location.hash.slice(2)||"topics");window.scrollTo(0,0);};window.addEventListener("hashchange",change);return()=>window.removeEventListener("hashchange",change);},[]);
  const navigate=(path:string)=>{location.hash="/"+path;};
  const open=(id:string,topic?:string)=>navigate(`read/${id}${topic?`?topic=${topic}`:""}`);
  const article=path.startsWith("read/")?articles.find(a=>a.id===path.slice(5).split("?")[0]):undefined;
  const topic=article?topicForArticle(new URLSearchParams(path.split("?")[1]??"").get("topic"),article.id):undefined;
  return <div style={{maxWidth:390,margin:"auto",padding:16}}><p className="hint">隔离测试 · 进度仅留在此页，刷新即重置</p>{article?<Reader key={path} article={article} topic={topic} state={state} update={setState} toggleSave={()=>{}} concept={()=>{}} open={open}/>:<Topics state={state} selected={path.split("/")[1]} navigate={navigate} open={open}/>}</div>;
}
createRoot(document.getElementById("root")!).render(<LanguageProvider initialLanguage="zh"><Preview/></LanguageProvider>);
