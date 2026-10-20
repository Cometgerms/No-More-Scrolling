import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import { TOPICS, topicProgress, topicForArticle } from "../src/topics";
import { articles } from "../src/content";
import { initialState } from "../src/model";
import { badgeProgress } from "../src/achievements";
import { subgroupWitness, cyclicCosets } from "../src/learning-models";
import { Topics } from "../src/TopicPage";
import { AlgebraExercise, ALGEBRA_EXERCISES } from "../src/AlgebraExercise";
import { LanguageProvider } from "../src/i18n";

test("four topic paths contain valid distinct lessons and AA has a real three-lesson sequence",()=>{
  assert.equal(TOPICS.length,4);
  assert.equal(new Set(TOPICS.map(t=>t.subject)).size,4);
  for(const t of TOPICS) { assert.equal(new Set(t.lessons).size,t.lessons.length); for(const id of t.lessons) assert.equal(articles.find(a=>a.id===id)?.subject,t.subject); }
  assert.deepEqual(TOPICS[0].lessons,["clockwork-groups","subgroup-test","cosets-and-lagrange"]);
  assert.equal(topicForArticle("abstract-algebra","machine-against-itself"),undefined);
  assert.equal(topicForArticle("abstract-algebra","subgroup-test")?.id,"abstract-algebra");
});
test("topic progress and achievements use shared completion records; reopening does not add credit",()=>{
  const state=structuredClone(initialState), topic=TOPICS[0];
  for(let i=0;i<=3;i++) {
    const p=topicProgress(topic,state); assert.equal(p.completed,i); assert.equal(p.next,topic.lessons[i]);
    const badges=badgeProgress(state,"2026-10-19").filter(b=>b.id.startsWith("aa-"));
    assert.equal(badges.filter(b=>b.earned).length,i);
    if(i<3) state.progress[topic.lessons[i]]={section:3,complete:true};
  }
  state.progress[topic.lessons[0]].section=0;
  assert.equal(topicProgress(topic,state).completed,3);
});
test("subgroup test checks all 256 subsets of Z8 against independently generated subgroups",()=>{
  const expected=new Set(["0","0,4","0,2,4,6","0,1,2,3,4,5,6,7"]);
  for(let mask=0;mask<256;mask++) {
    const set=Array.from({length:8},(_,i)=>i).filter(i=>mask&(1<<i)), witness=subgroupWitness(set);
    assert.equal(set.length>0&&!witness,expected.has(set.join(",")));
    if(witness) { assert.ok(set.includes(witness.a)&&set.includes(witness.b)); assert.ok(!set.includes(witness.result)); }
  }
});
test("cosets partition every small cyclic group into equal-sized blocks",()=>{
  for(let n=2;n<=24;n++) for(let k=0;k<n;k++) {
    const {subgroup,cosets}=cyclicCosets(n,k);
    assert.equal(cosets.length*subgroup.length,n);
    assert.ok(cosets.every(row=>row.length===subgroup.length));
    assert.deepEqual(cosets.flat().sort((a,b)=>a-b),Array.from({length:n},(_,i)=>i));
  }
});
test("topic and textbook practice render in both languages with valid equations",()=>{
  for(const exercise of Object.values(ALGEBRA_EXERCISES)) assert.doesNotThrow(()=>katex.renderToString(exercise.formula,{throwOnError:true}));
  for(const language of ["zh","en"] as const) for(const selected of [undefined,...TOPICS.map(t=>t.id)]) {
    const html=renderToStaticMarkup(React.createElement(LanguageProvider,{initialLanguage:language,children:React.createElement(Topics,{state:initialState,selected,navigate:()=>{},open:()=>{}})}));
    if(language==="en") assert.ok(!/[\u3400-\u9fff]/.test(html));
  }
  for(const articleId of TOPICS[0].lessons) {
    const html=renderToStaticMarkup(React.createElement(LanguageProvider,{initialLanguage:"en",children:React.createElement(AlgebraExercise,{articleId})}));
    assert.ok(html.includes("Gallian 8e")); assert.ok(html.includes("Walk through the solution")); assert.ok(!/[\u3400-\u9fff]/.test(html));
  }
});
