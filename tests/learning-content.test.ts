import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { articles, concepts, edges } from "../src/content";
import { initialState } from "../src/model";
import { Graph } from "../src/Graph";
import { learnedGraph } from "../src/learned-graph";
import { additiveOrbit, cooperationValues, sortingBound } from "../src/learning-models";

test("additive orbits agree with n/gcd(n,k), include identity once and return to it", () => {
  const gcd = (a:number,b:number):number => b ? gcd(b,a%b) : a;
  for (let n=2;n<=24;n++) for (let k=0;k<n;k++) {
    const orbit=additiveOrbit(n,k);
    assert.equal(orbit.length,n/gcd(n,k));
    assert.equal(new Set(orbit).size,orbit.length);
    assert.equal((orbit.at(-1)!+k)%n,0);
    assert.ok(orbit.every(x=>x>=0&&x<n));
  }
  assert.deepEqual(additiveOrbit(12,8),[0,8,4]);
  assert.throws(()=>additiveOrbit(0,1));
});
test("sorting bound brackets all permutations and cooperation changes incentive at one half",()=>{
  for(let n=2;n<=12;n++) { const {permutations,comparisons}=sortingBound(n); assert.ok(2**comparisons>=permutations); assert.ok(2**(comparisons-1)<permutations); }
  assert.deepEqual(sortingBound(4),{permutations:24,comparisons:5});
  for(const delta of [0,.25,.5,.75,.95]) { const v=cooperationValues(delta); assert.equal(v.cooperate>=v.defect,delta>=.5); }
  assert.deepEqual(cooperationValues(.75),{cooperate:12,defect:8});
  assert.throws(()=>cooperationValues(1));
});
test("each single completed article reveals exactly its concepts; saved items and partial progress do not unlock nodes or edges",()=>{
  for(const article of articles) {
    const state=structuredClone(initialState);
    state.saved=concepts.map(c=>c.id);
    state.progress=Object.fromEntries(articles.map(a=>[a.id,{section:3,complete:a.id===article.id}]));
    state.edges=[{from:"group",to:"halting",label:"Hidden personal edge",personal:true}];
    const graph=learnedGraph({articles,concepts,edges},state), ids=new Set(article.concepts);
    assert.deepEqual(new Set(graph.concepts.map(c=>c.id)),ids);
    assert.ok(graph.edges.every(e=>ids.has(e.from)&&ids.has(e.to)));
    const html=renderToStaticMarkup(React.createElement(Graph,{state,selected:"halting",setSelected:()=>{},update:()=>{},open:()=>{}}));
    assert.deepEqual(new Set([...html.matchAll(/data-node="([^"]+)"/g)].map(m=>m[1])),ids);
    assert.ok(!html.includes("Hidden personal edge"));
  }
});
test("knowledge index contains every article, concept and source, without private file paths",()=>{
  const index=readFileSync(new URL("../KNOWLEDGE_INDEX.md",import.meta.url),"utf8");
  for(const article of articles) { assert.ok(index.includes(`### ${article.id}`)); for(const s of article.sources) assert.ok(index.includes(s.url)); }
  for(const c of concepts) assert.ok(index.includes(`| ${c.id} |`));
  assert.ok(!index.includes("C:/Users/")&&!index.includes("C:\\Users\\"));
});
