import test from "node:test";
import assert from "node:assert/strict";
import { articles } from "../src/content";
import { dailySelection, validateState } from "../src/logic";
import { mergeStates } from "../src/sync-merge";
import { initialState } from "../src/model";

const yesterday = ["zero-is-not-impossible", "tiny-cache-big-miss", "borrowing-power", "who-sets-the-agenda"];
const oldToday = ["zero-is-not-impossible", "tiny-cache-big-miss", "snow-beyond-the-map", "majority-without-winner"];

test("expanding from two to three articles per subject does not repeat yesterday's math and CS", () => {
  const state = structuredClone(initialState);
  state.daily["2026-10-18"] = yesterday;
  const picks = dailySelection("2026-10-19", state);
  assert.ok(picks.every(id => !yesterday.includes(id)));
  assert.equal(new Set(picks.map(id => articles.find(a => a.id === id)!.subject)).size, 4);
});

test("repairs already cached repetitions without changing unaffected picks, history or reading progress", () => {
  const state = structuredClone(initialState);
  state.daily = { "2026-10-18": yesterday, "2026-10-19": oldToday };
  state.progress[yesterday[0]] = { section: 2, complete: false };
  state.progress[yesterday[1]] = { section: 3, complete: true };
  const before = structuredClone(state);
  const repaired = dailySelection("2026-10-19", state);
  assert.ok(repaired.every(id => !yesterday.includes(id)));
  assert.deepEqual(repaired.slice(2), oldToday.slice(2));
  assert.deepEqual(state, before);
  state.daily["2026-10-19"] = repaired;
  state.difficulty = 2;
  state.interests = "Cantor";
  for (const id of repaired) state.progress[id] = { section: 3, complete: true, completedOn: "2026-10-19", feedback: "skip" };
  assert.deepEqual(dailySelection("2026-10-19", state), repaired);
});

test("completed articles never enter new picks, including old completed records without a date", () => {
  const state = structuredClone(initialState);
  for (const id of oldToday) state.progress[id] = { section: 3, complete: true };
  state.daily["2026-10-19"] = oldToday;
  const picks = dailySelection("2026-10-19", state);
  assert.equal(picks.length, 4);
  assert.ok(picks.every(id => !state.progress[id]?.complete));
  state.daily["2026-10-19"] = picks;
  state.progress[picks[0]] = { section: 3, complete: true, completedOn: "2026-10-19" };
  assert.deepEqual(dailySelection("2026-10-19", state), picks);
  assert.ok(!dailySelection("2026-10-20", state).includes(picks[0]));
});

test("exhausted subjects are omitted and variable-size selections survive backup validation", () => {
  const state = structuredClone(initialState);
  for (const a of articles.filter(a => a.subject === "math")) state.progress[a.id] = { section: 3, complete: true };
  const picks = dailySelection("2026-10-19", state);
  assert.equal(picks.length, 3);
  assert.ok(picks.every(id => articles.find(a => a.id === id)!.subject !== "math"));
  state.daily["2026-10-19"] = picks;
  assert.deepEqual(validateState(state).daily, state.daily);
  for (const a of articles) state.progress[a.id] = { section: 3, complete: true };
  state.daily["2026-10-20"] = dailySelection("2026-10-20", state);
  assert.deepEqual(state.daily["2026-10-20"], []);
  assert.deepEqual(validateState(state).daily["2026-10-20"], []);
});

test("the last unread article remains available even if it was offered yesterday", () => {
  const state = structuredClone(initialState);
  for (const a of articles) state.progress[a.id] = { section: 3, complete: true };
  state.progress[yesterday[0]] = { section: 2, complete: false };
  state.daily["2026-10-18"] = yesterday;
  assert.deepEqual(dailySelection("2026-10-19", state), [yesterday[0]]);
});

test("completion date survives validation and stale-device merging without redating legacy reads", () => {
  const base = structuredClone(initialState), local = structuredClone(base), remote = structuredClone(base);
  local.progress[yesterday[0]] = { section: 1, complete: false };
  remote.progress[yesterday[0]] = { section: 3, complete: true, completedOn: "2026-10-18" };
  const merged = mergeStates(base, local, remote).state;
  assert.equal(validateState(merged).progress[yesterday[0]].completedOn, "2026-10-18");
  local.progress[yesterday[0]] = { section: 3, complete: true };
  assert.equal(mergeStates(base, local, remote).state.progress[yesterday[0]].completedOn, undefined);
});

test("successive daily selections avoid repeats even when feedback changes; future records are ignored", () => {
  const state = structuredClone(initialState);
  state.daily["2099-01-01"] = oldToday;
  let previous: string[] = [];
  for (let i = 0; i < 45; i++) {
    const date = new Date(Date.UTC(2026, 9, 18 + i)).toISOString().slice(0, 10);
    for (const [j,a] of articles.entries()) state.progress[a.id] = { section: i % 4, complete: i % 2 === 0, feedback: (i+j)%3 === 0 ? "skip" : "interesting" };
    const picks = dailySelection(date, state);
    assert.ok(picks.every(id => !previous.includes(id)), date);
    state.daily[date] = picks;
    assert.deepEqual(dailySelection(date, state), picks);
    previous = picks;
  }
});
