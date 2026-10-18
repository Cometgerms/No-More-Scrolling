import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import { emptyState, equal, mergeStates } from "../src/sync-merge";
import { emptyRecord, loadAccount, saveAccount, type AccountRecord } from "../src/account-storage";
import { LibraryStore, type LocalGateway } from "../src/library-store";
import type { CloudGateway, CloudRecord } from "../src/cloud";

const tick = () => new Promise<void>(resolve => setImmediate(resolve));
test("JSONB object key ordering does not create spurious changes", () => {
  assert.ok(equal({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 }));
  assert.equal(equal([1, 2], [2, 1]), false);
});
async function settle() { for (let i = 0; i < 12; i++) await tick(); }
function fixture() {
  const records = new Map<string | null, AccountRecord>();
  const rows = new Map<string, CloudRecord>();
  const local: LocalGateway = {
    async load(id) { return structuredClone(records.get(id) ?? emptyRecord()); },
    async save(id, value) { records.set(id, structuredClone(value)); return true; },
  };
  const cloud: CloudGateway = {
    async read(id) { return structuredClone(rows.get(id) ?? null); },
    async write(id, revision, state) {
      if ((rows.get(id)?.revision ?? 0) !== revision) return null;
      const row = { state: structuredClone(state), revision: revision + 1 };
      rows.set(id, row); return structuredClone(row);
    },
  };
  return { records, rows, local, cloud, store: new LibraryStore(local, cloud) };
}

test("three-way bookmarks retain independent changes and removals", () => {
  const base = emptyState(); base.saved = ["measure"];
  const local = structuredClone(base); local.saved = ["cantor"];
  const remote = structuredClone(base); remote.saved.push("cache");
  assert.deepEqual(new Set(mergeStates(base, local, remote).state.saved), new Set(["cantor", "cache"]));
});
test("going back a chapter survives synchronization without undoing completion", async () => {
  const f = fixture(); const state = emptyState();
  state.progress["zero-is-not-impossible"] = { section: 2, complete: true };
  f.rows.set("A", { state, revision: 1 });
  await f.store.activate({ id: "A" }); await settle();
  f.store.update(s => ({ ...s, progress: { ...s.progress, "zero-is-not-impossible": { ...s.progress["zero-is-not-impossible"], section: 1 } } }));
  await f.store.sync(); await f.store.sync();
  assert.equal(f.store.getSnapshot().state.progress["zero-is-not-impossible"].section, 1);
  assert.equal(f.rows.get("A")?.state.progress["zero-is-not-impossible"].section, 1);
  assert.equal(f.store.getSnapshot().state.progress["zero-is-not-impossible"].complete, true);
});
test("going back during an upload is not replaced by the upload response", async () => {
  const f = fixture(); await f.store.activate({ id: "A" }); await settle();
  const original = f.cloud.write; let release!: () => void;
  f.cloud.write = async (...args) => { await new Promise<void>(resolve => { release = resolve; }); return original(...args); };
  f.store.update(s => ({ ...s, progress: { "zero-is-not-impossible": { section: 2, complete: false } } }));
  const uploading = f.store.sync(); await settle();
  f.store.update(s => ({ ...s, progress: { "zero-is-not-impossible": { section: 1, complete: false } } }));
  release(); await uploading;
  assert.equal(f.store.getSnapshot().state.progress["zero-is-not-impossible"].section, 1);
  f.cloud.write = original; await f.store.sync();
  assert.equal(f.rows.get("A")?.state.progress["zero-is-not-impossible"].section, 1);
});
test("concurrent notes and delete/edit conflicts retain both alternatives", () => {
  const base = emptyState(); base.notes.measure = "original";
  const local = structuredClone(base); delete local.notes.measure;
  const remote = structuredClone(base); remote.notes.measure = "other device";
  assert.deepEqual(mergeStates(base, local, remote).conflicts, [{ id: "measure", local: undefined, remote: "other device" }]);
});
test("guest data stays separate until explicit import, and signout returns to guest", async () => {
  const f = fixture(); const guest = emptyRecord(); guest.state.notes.measure = "guest"; f.records.set(null, guest);
  await f.store.activate({ id: "A" }); await settle();
  assert.equal(f.store.getSnapshot().state.notes.measure, undefined);
  await f.store.importGuest(); await settle();
  assert.equal(f.rows.get("A")?.state.notes.measure, "guest");
  await f.store.activate({ id: "B" }); await settle();
  assert.equal(f.store.getSnapshot().state.notes.measure, undefined);
  await f.store.activate(null);
  assert.equal(f.store.getSnapshot().state.notes.measure, "guest");
});
test("two devices preserve unrelated edits through revision races", async () => {
  const f = fixture(); const second = new LibraryStore(f.local, f.cloud);
  await f.store.activate({ id: "A" }); await settle(); await second.activate({ id: "A" }); await settle();
  f.store.update(s => ({ ...s, notes: { ...s.notes, measure: "first" } }));
  second.update(s => ({ ...s, notes: { ...s.notes, cantor: "second" } }));
  await Promise.all([f.store.sync(), second.sync()]); await f.store.sync();
  assert.deepEqual(f.rows.get("A")?.state.notes, { measure: "first", cantor: "second" });
});
test("same-note edits stop uploads until the user resolves the conflict", async () => {
  const f = fixture(); await f.store.activate({ id: "A" }); await settle();
  f.store.update(s => ({ ...s, notes: { measure: "local" } }));
  const remote = emptyState(); remote.notes.measure = "remote";
  f.rows.set("A", { state: remote, revision: 2 });
  await f.store.sync();
  assert.equal(f.store.getSnapshot().status, "conflict");
  assert.equal(f.rows.get("A")?.state.notes.measure, "remote");
  f.store.resolve("measure", "local + remote"); await settle();
  assert.equal(f.rows.get("A")?.state.notes.measure, "local + remote");
});
test("edits during an upload remain pending and upload on next sync", async () => {
  const f = fixture(); await f.store.activate({ id: "A" }); await settle();
  const original = f.cloud.write; let release!: () => void;
  f.cloud.write = async (...args) => { await new Promise<void>(resolve => { release = resolve; }); return original(...args); };
  f.store.update(s => ({ ...s, notes: { measure: "first" } }));
  const syncing = f.store.sync(); await settle();
  f.store.update(s => ({ ...s, notes: { measure: "typed while uploading" } }));
  release(); await syncing;
  assert.equal(f.store.getSnapshot().state.notes.measure, "typed while uploading");
  assert.equal(f.store.getSnapshot().status, "pending");
  f.cloud.write = original; await f.store.sync();
  assert.equal(f.rows.get("A")?.state.notes.measure, "typed while uploading");
});
test("late responses from account A never become account B's visible or persisted library", async () => {
  const f = fixture(); let release!: (row: CloudRecord | null) => void;
  const read = f.cloud.read;
  f.cloud.read = id => id === "A" ? new Promise(resolve => { release = resolve; }) : read(id);
  await f.store.activate({ id: "A" });
  await f.store.activate({ id: "B" }); await settle();
  const secret = emptyState(); secret.notes.measure = "A only"; release({ state: secret, revision: 1 }); await settle();
  assert.equal(f.store.getSnapshot().owner?.id, "B");
  assert.equal(f.store.getSnapshot().state.notes.measure, undefined);
  assert.equal(f.records.get("B")?.state.notes.measure, undefined);
});
test("offline edits survive restart and later synchronize", async () => {
  const f = fixture(); const read = f.cloud.read;
  f.cloud.read = async () => { throw Error("offline"); };
  await f.store.activate({ id: "A" }); await settle();
  f.store.update(s => ({ ...s, notes: { measure: "offline" } })); await f.store.persist();
  const fresh = new LibraryStore(f.local, f.cloud); await fresh.activate({ id: "A" }); await settle();
  assert.equal(fresh.getSnapshot().state.notes.measure, "offline");
  f.cloud.read = read; await fresh.sync();
  assert.equal(f.rows.get("A")?.state.notes.measure, "offline");
});
test("local account records survive fallback storage and remain isolated", async () => {
  const mirror = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k: string) => mirror.get(k) ?? null, setItem: (k: string, v: string) => mirror.set(k, v) } });
  const a = emptyRecord(); a.state.notes.measure = "A only";
  await saveAccount("A", a); await saveAccount("B", emptyRecord()); mirror.clear();
  assert.equal((await loadAccount("A")).state.notes.measure, "A only");
  assert.equal((await loadAccount("B")).state.notes.measure, undefined);
});
