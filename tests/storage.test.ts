import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/model";
import { loadState, saveState } from "../src/storage";
test("persistence survives a fresh load, unavailable localStorage and rapid successive writes", async () => {
  const mirror = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => mirror.get(k) ?? null,
      setItem: (k: string, v: string) => mirror.set(k, v),
    },
  });
  const state = structuredClone(initialState);
  state.saved = ["measure"];
  state.notes.measure = "Persistent note";
  assert.equal(await saveState(state), true);
  assert.deepEqual((await loadState()).state, state);
  mirror.clear();
  assert.deepEqual((await loadState()).state, state);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("storage blocked");
    },
  });
  assert.deepEqual((await loadState()).state, state);
  const newer = { ...state, notes: { measure: "Newest note" } };
  await Promise.all([saveState(state), saveState(newer)]);
  assert.deepEqual((await loadState()).state, newer);
});
