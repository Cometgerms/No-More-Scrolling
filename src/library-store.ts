import type { State } from "./model";
import type { CloudGateway } from "./cloud";
import { emptyRecord, type AccountRecord } from "./account-storage";
import { emptyState, equal, mergeStates } from "./sync-merge";

type Owner = { id: string; email?: string } | null;
export type SyncStatus = "guest" | "pending" | "syncing" | "synced" | "error" | "conflict";
export type LibrarySnapshot = { state: State; ready: boolean; owner: Owner; status: SyncStatus; error: string; conflicts: AccountRecord["conflicts"]; imported: boolean };
export interface LocalGateway {
  load(id: string | null): Promise<AccountRecord>;
  save(id: string | null, record: AccountRecord): Promise<boolean>;
}

/** @ensures Account changes invalidate in-flight requests before they can touch the visible library. */
export class LibraryStore {
  private record = emptyRecord();
  private generation = 0;
  private syncing = false;
  private listeners = new Set<() => void>();
  private snapshot: LibrarySnapshot = { state: emptyState(), ready: false, owner: null, status: "guest", error: "", conflicts: [], imported: false };
  constructor(private local: LocalGateway, private cloud: CloudGateway) {}
  getSnapshot = () => this.snapshot;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private emit(patch: Partial<LibrarySnapshot> = {}) {
    this.snapshot = { ...this.snapshot, state: this.record.state, conflicts: this.record.conflicts, imported: this.record.imported, ...patch };
    this.listeners.forEach(fn => fn());
  }
  async activate(owner: Owner) {
    if (this.snapshot.ready && this.snapshot.owner?.id === owner?.id) return;
    const generation = ++this.generation;
    this.syncing = false;
    this.record = emptyRecord();
    this.emit({ ready: false, owner, error: "", status: owner ? "pending" : "guest" });
    try {
      const record = await this.local.load(owner?.id ?? null);
      if (generation !== this.generation) return;
      this.record = record;
      this.emit({ ready: true, status: record.conflicts.length ? "conflict" : owner ? "pending" : "guest" });
      if (owner) void this.sync();
    } catch {
      if (generation === this.generation) this.emit({ error: "load", ready: false });
    }
  }
  update = (next: State | ((state: State) => State)) => {
    if (!this.snapshot.ready) return;
    const state = typeof next === "function" ? next(this.record.state) : next;
    if (state === this.record.state) return;
    this.record = { ...this.record, state };
    this.emit({ status: this.record.conflicts.length ? "conflict" : this.snapshot.owner ? "pending" : "guest" });
    void this.persist();
  };
  persist = async () => {
    if (!this.snapshot.ready) return false;
    const generation = this.generation;
    const ok = await this.local.save(this.snapshot.owner?.id ?? null, this.record);
    if (!ok && generation === this.generation) this.emit({ error: "save", status: "error" });
    return ok;
  };
  async importGuest() {
    if (!this.snapshot.owner || !this.snapshot.ready || this.record.imported) return;
    const generation = this.generation;
    const guest = await this.local.load(null);
    if (generation !== this.generation) return;
    const merged = mergeStates(emptyState(), guest.state, this.record.state);
    this.record = { ...this.record, ...merged, imported: true };
    this.emit({ status: merged.conflicts.length ? "conflict" : "pending" });
    await this.persist();
    void this.sync();
  }
  resolve(id: string, value: string | undefined) {
    const notes = { ...this.record.state.notes };
    if (value === undefined) delete notes[id]; else notes[id] = value;
    this.record = { ...this.record, state: { ...this.record.state, notes }, conflicts: this.record.conflicts.filter(c => c.id !== id) };
    this.emit({ status: this.record.conflicts.length ? "conflict" : "pending" });
    void this.persist().then(() => this.sync());
  }
  sync = async () => {
    const owner = this.snapshot.owner;
    if (!owner || !this.snapshot.ready || this.syncing || this.record.conflicts.length) return;
    const generation = this.generation;
    const current = () => generation === this.generation;
    this.syncing = true;
    this.emit({ status: "syncing", error: "" });
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await this.cloud.read(owner.id);
        if (!current()) return;
        if (this.record.conflicts.length) { this.emit({ status: "conflict" }); return; }
        const merged = mergeStates(this.record.base, this.record.state, remote?.state ?? emptyState());
        this.record = { ...this.record, ...merged, base: remote?.state ?? emptyState() };
        this.emit();
        if (!await this.persist()) throw new Error("save");
        if (!current()) return;
        if (merged.conflicts.length) { this.emit({ status: "conflict" }); return; }
        const sent = this.record.state;
        if (remote && equal(sent, remote.state)) { this.emit({ status: "synced" }); return; }
        const result = await this.cloud.write(owner.id, remote?.revision ?? 0, sent);
        if (!current()) return;
        if (!result) continue; // Another device won the revision; re-read before writing.
        const after = mergeStates(sent, this.record.state, result.state);
        this.record = { ...this.record, ...after, base: result.state };
        if (!await this.persist()) throw new Error("save");
        if (!current()) return;
        this.emit({ status: equal(this.record.state, result.state) ? "synced" : "pending" });
        return;
      }
      throw new Error("busy");
    } catch {
      if (current()) this.emit({ status: "error", error: this.snapshot.error || "sync" });
    } finally { if (current()) this.syncing = false; }
  };
}
