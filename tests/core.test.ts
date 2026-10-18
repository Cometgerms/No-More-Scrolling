import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { renderToString } from "react-dom/server";
import React from "react";
import { articles, concepts, edges } from "../src/content";
import { initialState } from "../src/model";
import {
  cacheTrace,
  cantorIntervals,
  condorcetWinner,
  dailySelection,
  localDate,
  pairwise,
  validateState,
} from "../src/logic";
import { Lab } from "../src/Labs";
import { Graph } from "../src/Graph";
test("daily picks are stable within a local date and cover all four subjects", () => {
  const state = structuredClone(initialState),
    date = "2026-10-17",
    picks = dailySelection(date, state);
  assert.equal(picks.length, 4);
  assert.equal(
    new Set(picks.map((id) => articles.find((a) => a.id === id)?.subject)).size,
    4,
  );
  state.daily[date] = picks;
  state.difficulty = 2;
  state.interests = "Cantor";
  assert.deepEqual(dailySelection(date, state), picks);
  assert.notDeepEqual(dailySelection("2026-10-18", state), picks);
});
test("local day follows New York midnight, not UTC midnight, including DST", () => {
  const old = process.env.TZ;
  process.env.TZ = "America/New_York";
  assert.equal(localDate(new Date("2026-10-18T01:00:00Z")), "2026-10-17");
  assert.equal(localDate(new Date("2026-10-18T04:01:00Z")), "2026-10-18");
  assert.equal(localDate(new Date("2026-11-01T05:30:00Z")), "2026-11-01");
  if (old === undefined) delete process.env.TZ;
  else process.env.TZ = old;
});
test("not interested decreases future selection priority", () => {
  const state = structuredClone(initialState),
    picks = dailySelection("2026-10-17", state),
    id = picks[0];
  state.progress[id] = { section: 0, complete: false, feedback: "skip" };
  assert.notEqual(dailySelection("2026-10-17", state)[0], id);
});
test("direct mapped cache distinguishes conflict and compulsory misses", () => {
  assert.deepEqual(
    cacheTrace([0, 64, 0, 64, 0, 64]).map((r) => r.hit),
    [false, false, false, false, false, false],
  );
  assert.deepEqual(
    cacheTrace([0, 16, 0, 16, 0, 16]).map((r) => r.hit),
    [false, false, true, true, true, true],
  );
  assert.equal(cacheTrace([128])[0].set, 0);
  assert.equal(cacheTrace([0, 15])[1].hit, true);
});
test("Cantor approximants have exactly 2^n intervals and length (2/3)^n", () => {
  for (let n = 0; n <= 6; n++) {
    const ranges = cantorIntervals(n);
    assert.equal(ranges.length, 2 ** n);
    assert.ok(
      Math.abs(
        ranges.reduce((total, [a, b]) => total + b - a, 0) - (2 / 3) ** n,
      ) < 1e-10,
    );
    assert.equal(ranges[0][0], 0);
    assert.equal(ranges.at(-1)![1], 1);
  }
});
test("pairwise model exposes cycle, strict winner, and ties", () => {
  assert.deepEqual(
    pairwise([1, 1, 1]).map((r) => r.winner),
    ["A", "B", "C"],
  );
  assert.equal(condorcetWinner([1, 1, 1]), null);
  assert.equal(condorcetWinner([5, 1, 1]), "A");
  assert.ok(pairwise([2, 1, 1]).some((r) => r.winner === "tie"));
  for (let a = 1; a <= 9; a++)
    for (let b = 1; b <= 9; b++)
      for (let c = 1; c <= 9; c++) {
        const rs = pairwise([a, b, c]);
        for (const r of rs) assert.equal(r.av + r.bv, a + b + c);
        const w = condorcetWinner([a, b, c]);
        if (w)
          assert.ok(
            rs
              .filter((r) => r.a === w || r.b === w)
              .every((r) => r.winner === w),
          );
      }
});
test("content graph, metadata, quizzes and formula syntax are valid", () => {
  const nodeIds = new Set(concepts.map((c) => c.id));
  assert.equal(nodeIds.size, concepts.length);
  assert.equal(new Set(articles.map((a) => a.id)).size, articles.length);
  for (const a of articles) {
    assert.ok(a.sections.length >= 4);
    assert.ok(a.sources.length);
    assert.ok(a.quiz.answer >= 0 && a.quiz.answer < a.quiz.options.length);
    assert.equal(a.quiz.options.length, a.quiz.explanations.length);
    for (const id of a.concepts) assert.ok(nodeIds.has(id));
    for (const section of [...a.sections, a.deep])
      for (const block of section.blocks)
        if (block.kind === "math")
          assert.doesNotThrow(() =>
            katex.renderToString(block.body, { throwOnError: true }),
          );
  }
  for (const e of edges) {
    assert.ok(nodeIds.has(e.from));
    assert.ok(nodeIds.has(e.to));
  }
});
test("backup roundtrip preserves saved concepts, notes, links and progress", () => {
  const state = structuredClone(initialState);
  state.saved = ["measure", articles[0].id];
  state.notes.measure = "概率为零不等于空集";
  state.edges = [
    { from: "measure", to: "halting", label: "个人问题", personal: true },
  ];
  state.progress[articles[0].id] = { section: 2, complete: true, answer: 1 };
  state.daily["2026-10-17"] = dailySelection("2026-10-17", state);
  state.seconds["2026-10-17"] = 123;
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(state))), state);
});
test("invalid backup cannot introduce broken nodes or out-of-range reading sections", () => {
  assert.throws(() => validateState({ version: 99 }));
  assert.throws(() => validateState(null));
  const state = validateState({
    version: 1,
    saved: ["unknown"],
    edges: [{ from: "unknown", to: "measure", label: "bad" }],
    progress: {
      [articles[0].id]: { section: 1.8, complete: false, answer: 99 },
    },
    notes: { unknown: "x" },
    seconds: { "2026-10-17": -1 },
  });
  assert.deepEqual(state.saved, []);
  assert.deepEqual(state.edges, []);
  assert.equal(state.progress[articles[0].id].section, 1);
  assert.equal(state.progress[articles[0].id].answer, undefined);
  assert.deepEqual(state.notes, {});
});
test("all eight labs and the concept graph render without runtime exceptions", () => {
  for (const article of articles) {
    const html = renderToString(React.createElement(Lab, { article }));
    assert.ok(html.includes("THOUGHT LAB"));
  }
  const html = renderToString(
    React.createElement(Graph, {
      state: initialState,
      update: () => {},
      open: () => {},
      selected: "measure",
      setSelected: () => {},
    }),
  );
  assert.ok(html.includes("Countable additivity"));
});
