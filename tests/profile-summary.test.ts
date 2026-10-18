import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/model";
import { validateState } from "../src/logic";
import { activityDays } from "../src/Profile";
import { archiveFeed, parseBriefs, summaryEndpoint, topic, summarize } from "../src/world-summary";
import type { WorldFeed } from "../src/world-data";
test("old backups gain a default profile; edited profiles survive validation", () => {
  const legacy = { ...initialState } as Partial<typeof initialState>; delete legacy.profile;
  assert.deepEqual(validateState(legacy).profile, initialState.profile);
  const next = structuredClone(initialState); next.profile = { name: "Alan", bio: "Math", avatar: 2 };
  assert.deepEqual(validateState(next).profile, next.profile);
  assert.equal(validateState({ ...next, profile: { name: "x".repeat(200), avatar: 999 } }).profile.name.length, 40);
  assert.equal(validateState({ ...next, profile: { avatar: 999 } }).profile.avatar, 0);
});
test("activity achievements count qualifying distinct days rather than page opens", () => {
  const state = structuredClone(initialState); state.seconds = { "2025-01-01": 59, "2025-01-02": 60, "2025-01-03": 180, "2099-01-01": 400 };
  assert.deepEqual(activityDays(state), ["2025-01-02", "2025-01-03"]);
});
test("historical briefs retain one snapshot per UTC day and at most thirty editions", () => {
  let history: WorldFeed[] = [];
  for (let day=1; day<=31; day++) history=archiveFeed(history,{version:1,fetchedAt:`2025-01-${String(day).padStart(2,"0")}T10:00:00Z`,events:[]});
  assert.equal(history.length,30);
  history=archiveFeed(history,{version:1,fetchedAt:"2025-01-31T15:00:00Z",events:[]});
  assert.equal(history.length,30); assert.equal(history[0].fetchedAt,"2025-01-31T15:00:00Z");
});
test("summary API allows loopback development but rejects plaintext remote and embedded secrets", () => {
  assert.ok(summaryEndpoint("http://localhost:8787/summarize"));
  assert.ok(summaryEndpoint("https://example.com/summarize"));
  for(const value of ["http://example.com/summarize","https://key@example.com","https://example.com/?key=x"]) assert.throws(()=>summaryEndpoint(value));
});
test("summary results must refer to supplied reports and have bounded structured fields", () => {
  const event = {id:"one",title:"Foreign minister announces sanctions",url:"https://example.com",region:"europe" as const,source:"Test",publishedAt:"2025-01-01"};
  const brief={id:"one",summary:"Reported fact",significance:"Possible implication",category:"diplomacy"};
  assert.equal(topic(event),"diplomacy");
  assert.equal(parseBriefs({summaries:[brief]},[event]).length,1);
  assert.throws(()=>parseBriefs({summaries:[{...brief,id:"invented"}]},[event]));
  assert.throws(()=>parseBriefs({summaries:[{...brief,summary:""}]},[event]));
});
test("summary request passes source evidence and language to the local endpoint", async () => {
  const event = {id:"one",title:"Policy report",url:"https://example.com",region:"europe" as const,source:"Test",publishedAt:"2025-01-01"};
  const mock = (async (url, init) => {
    assert.equal(url, "http://localhost:8787/summarize");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.language, "zh"); assert.deepEqual(body.events, [event]);
    assert.equal(init?.credentials,"omit"); assert.equal(init?.redirect,"error");
    return new Response(JSON.stringify({summaries:[{id:"one",summary:"要点",significance:"影响",category:"policy"}]}));
  }) as typeof fetch;
  assert.equal((await summarize("http://localhost:8787/summarize",[event],"zh",new AbortController().signal,mock))[0].summary,"要点");
});
