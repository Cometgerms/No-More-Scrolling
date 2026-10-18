import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Graph } from "../src/Graph";
import { initialState } from "../src/model";
import { articles } from "../src/content";
import { NEWS_SOURCES, parseHeadlines } from "../src/news-feed";
import { archiveAnalysis, generateAnalysis, parseAnalysis, parseAnalysisArchive, type AnalysisEdition } from "../src/world-analysis";

const events=[{id:"one",title:"Diplomacy headline",source:"Publisher",region:"global" as const,url:"https://example.com/news",publishedAt:"2026-01-01T00:00:00Z"}];
const analysis={title:"Sample",introduction:"Bounded evidence",sections:[{heading:"Diplomacy",facts:"A headline reports talks",interpretation:"Outcomes remain uncertain",sourceIds:["one"]}],watch:["Check an official statement"],limitations:"Headlines only"};
test("graph reveals only completed articles, with an empty state before the first completion",()=>{
  const state=structuredClone(initialState);
  const render=()=>renderToStaticMarkup(React.createElement(Graph,{state,selected:"halting",setSelected:()=>{},update:()=>{},open:()=>{}}));
  assert.ok(render().includes("读完一篇"));
  state.progress[articles[0].id]={section:0,complete:false};assert.ok(!render().includes('data-node="measure"'));
  state.progress[articles[0].id].complete=true;
  const html=render();assert.ok(html.includes('data-node="measure"'));assert.ok(!html.includes('data-node="halting"'));
  assert.ok(!html.includes("让程序预测自己"));
});
test("publisher parsing decodes titles, rejects stale and unsafe items, and limits each source equally",()=>{
  assert.equal(NEWS_SOURCES.length,4);
  const item=(link:string,date:string,title="Talks &amp; policy")=>`<item><title><![CDATA[${title}]]></title><link>${link}</link><pubDate>${date}</pubDate></item>`;
  const xml=Array.from({length:10},(_,i)=>item(`https://example.com/${i}?utm_source=rss`,'2026-01-02T00:00:00Z')).join("")+item("javascript:alert(1)",'2026-01-02T00:00:00Z')+item("https://example.com/old",'2020-01-01T00:00:00Z');
  const parsed=parseHeadlines(xml,"Test",Date.parse("2026-01-03"));
  assert.equal(parsed.length,4);assert.equal(parsed[0].title,"Talks & policy");assert.equal(parsed[0].url,"https://example.com/0");
  assert.equal(parseHeadlines(item("https://example.com/future","2099-01-01"),"Test").length,0);
});
test("analysis refuses fabricated source IDs, empty evidence and excessive prose",()=>{
  assert.deepEqual(parseAnalysis(analysis,events),analysis);
  assert.throws(()=>parseAnalysis({...analysis,sections:[{...analysis.sections[0],sourceIds:["invented"]}]},events));
  assert.throws(()=>parseAnalysis({...analysis,sections:[{...analysis.sections[0],sourceIds:[]}]},events));
  assert.throws(()=>parseAnalysis({...analysis,introduction:"x".repeat(2001)},events));
});
test("manual and scheduled analysis share the configured API and bounded evidence",async()=>{
  const request=(async (_url,init)=>{
    assert.equal((init?.headers as Record<string,string>).Authorization,"Bearer test-key");
    const body=JSON.parse(String(init?.body));assert.equal(body.model,"test-model");
    assert.ok(body.messages.some((m:{content:string})=>m.content.includes("Diplomacy headline")));
    assert.ok(!String(init?.body).includes("test-key"));
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(analysis)}}]}));
  }) as typeof fetch;
  assert.deepEqual(await generateAnalysis({endpoint:"https://example.com/chat",model:"test-model",key:"test-key"},{version:1,fetchedAt:"2026-01-02T00:00:00Z",events},"zh",new AbortController().signal,request),analysis);
});
test("published analysis retains thirty daily editions with both languages and the exact evidence",()=>{
  let editions:AnalysisEdition[]=[];
  for(let day=1;day<=31;day++) editions=archiveAnalysis(editions,{generatedAt:`2026-01-${String(day).padStart(2,"0")}T10:23:00Z`,feedAt:"2026-01-01T00:00:00Z",events,zh:analysis,en:analysis});
  assert.equal(editions.length,30);
  const parsed=parseAnalysisArchive({version:1,status:"ready",editions});assert.equal(parsed.editions[0].generatedAt.slice(0,10),"2026-01-31");
  assert.equal(archiveAnalysis(editions,editions[0]).length,30);
  assert.throws(()=>parseAnalysisArchive({version:1,status:"ready",editions:[{...editions[0],en:{...analysis,sections:[]}}]}));
});
test("black-gold themes keep text and subject colors legible in both modes",()=>{
  const css=readFileSync(new URL("../src/styles.css",import.meta.url),"utf8");
  const luminance=(hex:string)=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const ratio=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  for(const selector of [":root",':root[data-theme="light"]']) {
    const block=css.slice(css.indexOf(selector+" {" )).split("}")[0];
    const colors=Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[\da-f]{6});/g)].map(m=>[m[1],m[2]]));
    for(const name of ["text","muted","accent","subject-math","subject-cs","subject-history","subject-politics"]) assert.ok(ratio(colors[name],colors.bg)>=4.5,`${selector} ${name}`);
    const ink=colors["accent-ink"]??"#ffffff";assert.ok(ratio(ink,colors.accent)>=4.5);
  }
});
test("all installable PNG icons use their declared dimensions",()=>{
  for(const [name,size] of [["apple-touch-icon.png",180],["icon-192.png",192],["icon-512.png",512]] as const){const png=readFileSync(new URL(`../public/${name}`,import.meta.url));assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
});
