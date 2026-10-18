import { openDB } from "idb";
import { validateState } from "./logic";
import { emptyState, type NoteConflict } from "./sync-merge";
import type { State } from "./model";

export type AccountRecord = { state: State; base: State; imported: boolean; conflicts: NoteConflict[] };
export const emptyRecord = (): AccountRecord => ({ state: emptyState(), base: emptyState(), imported: false, conflicts: [] });
const db = () => openDB("nms-accounts", 1, { upgrade(db) { db.createObjectStore("records"); } });
const key = (id: string) => `nms-account-v1:${id}`;
const validate = (raw: AccountRecord): AccountRecord => ({ state: validateState(raw.state), base: validateState(raw.base), imported: raw.imported === true, conflicts: Array.isArray(raw.conflicts) ? raw.conflicts.filter(c => typeof c.id === "string" && (c.local === undefined || typeof c.local === "string") && (c.remote === undefined || typeof c.remote === "string")) : [] });
export async function loadAccount(id: string): Promise<AccountRecord> {
  let corrupt = false;
  try { const raw = localStorage.getItem(key(id)); if (raw) return validate(JSON.parse(raw)); } catch { corrupt = true; }
  const raw = await (await db()).get("records", key(id));
  if (raw) return validate(raw);
  if (corrupt) throw new Error("Local account data could not be read. Export or recover it before continuing.");
  return emptyRecord();
}
let queue = Promise.resolve();
export function saveAccount(id: string, record: AccountRecord): Promise<boolean> {
  const copy = structuredClone(record);
  let mirrored = false;
  try { localStorage.setItem(key(id), JSON.stringify(copy)); mirrored = true; } catch { /* IndexedDB fallback */ }
  const result = queue.then(async () => { try { await (await db()).put("records", copy, key(id)); return true; } catch { return mirrored; } });
  queue = result.then(() => {});
  return result;
}
