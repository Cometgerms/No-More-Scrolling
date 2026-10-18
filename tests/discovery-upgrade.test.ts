import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { gestureView, zoomAt, edgeKey } from "../src/graph-gesture";
import { emptyState, mergeStates } from "../src/sync-merge";
import { validateState } from "../src/logic";
import { badgeProgress } from "../src/achievements";
import { ChatAnswer } from "../src/ChatAnswer";
import { summarizeWithAI } from "../src/world-summary";

test("pinch preserves the touched anchor while allowing midpoint movement", () => {
  const view = { zoom: 1, pan: {x:0,y:0} };
  const result = gestureView(view,[{x:100,y:100},{x:200,y:100}],[{x:60,y:120},{x:260,y:120}]);
  assert.equal(result.zoom,2);
  assert.equal(150*result.zoom+result.pan.x,160);
  assert.equal(100*result.zoom+result.pan.y,120);
  assert.equal(zoomAt(view,10,{x:150,y:100}).zoom,3);
  assert.equal(zoomAt(view,.01,{x:150,y:100}).zoom,.6);
});
test("one-finger panning and lifting one finger do not reset the viewport", () => {
  const view = {zoom:2,pan:{x:-100,y:-50}};
  assert.deepEqual(gestureView(view,[{x:10,y:20}],[{x:30,y:50}]),{zoom:2,pan:{x:-80,y:-20}});
  assert.deepEqual(gestureView(view,[],[]),view);
});
test("new profile and graph data survive backup validation and account merging", () => {
  const base = emptyState(), local = emptyState(), remote = emptyState();
  local.unlocked = ["rickroll"]; local.profile.badges = ["rickroll"];
  local.edgeReasons = { [edgeKey("measure","cantor")]: "My edited explanation" };
  remote.edgeReasons = { [edgeKey("halting","diagonal")]: "A different connection" };
  const merged = mergeStates(base,local,remote).state;
  assert.deepEqual(validateState(merged),merged);
  assert.equal(Object.keys(merged.edgeReasons!).length,2);
  const next = structuredClone(merged); next.edgeReasons![edgeKey("measure","cantor")] = "Revised";
  assert.equal(mergeStates(merged,next,merged).state.edgeReasons![edgeKey("measure","cantor")],"Revised");
  assert.deepEqual(mergeStates(base,base,local).state.unlocked,["rickroll"]);
});
test("badges count meaningful activity and require the Rickroll event", () => {
  const state = emptyState(); state.seconds = {"2026-01-01":3600,"2099-01-01":999999};
  let badges = badgeProgress(state,"2026-01-02");
  assert.equal(badges.find(b=>b.id==="time-60")?.earned,true);
  assert.equal(badges.find(b=>b.id==="days-10")?.earned,false);
  assert.equal(badges.find(b=>b.id==="rickroll")?.earned,false);
  state.unlocked = ["rickroll"]; badges=badgeProgress(state,"2026-01-02");
  assert.equal(badges.find(b=>b.id==="rickroll")?.earned,true);
});
test("chat renders math, lists, tables and code without interpreting HTML", () => {
  const text = '# Result\n**Bold** and \\(x^2\\).\n- One\n- Two\n\n| Item | Value |\n| --- | --- |\n| A | $2$ |\n\n\\[\\sum_{n=1}^{10}n\\]\n```js\n<script>alert(1)</script>\n```\n<script>bad</script>\n[bad](javascript:alert(1))';
  const html = renderToStaticMarkup(React.createElement(ChatAnswer,{text}));
  for (const tag of ["<h3>","<strong>","<ul>","<table>","<pre>","<math"]) assert.ok(html.includes(tag),tag);
  assert.ok(!html.includes("<script>")); assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes("katex-error"));
});
test("world summaries reuse the chat endpoint, model and key with source validation", async () => {
  const events = [{ id:"one",title:"Policy update",source:"Test",url:"https://example.com",publishedAt:"2026-01-01",region:"global" as const }];
  const mock = (async (url,init) => {
    assert.equal(url,"https://example.com/v1/chat/completions");
    assert.equal((init?.headers as Record<string,string>).Authorization,"Bearer test-key");
    const body = JSON.parse(String(init?.body)); assert.equal(body.model,"test-model");
    assert.ok(body.messages.some((m: {content:string}) => m.content.includes("Policy update")));
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({summaries:[{id:"one",summary:"Update",significance:"Uncertain",category:"policy"}]})}}]}));
  }) as typeof fetch;
  const result = await summarizeWithAI({endpoint:"https://example.com/v1/chat/completions",key:"test-key",model:"test-model"},events,"zh",new AbortController().signal,mock);
  assert.equal(result[0].id,"one");
});
