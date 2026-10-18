import { initialState, type State } from "./model";

export type NoteConflict = { id: string; local?: string; remote?: string };
export function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => equal(v, b[i]));
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;
  return Object.keys(left).length === Object.keys(right).length && Object.keys(left).every(key => Object.hasOwn(right, key) && equal(left[key], right[key]));
}
const choose = <T,>(base: T, local: T, remote: T): T => equal(base, local) ? remote : local;
const keys = (...objects: object[]) => [...new Set(objects.flatMap(Object.keys))];

/** @ensures Removals survive stale devices; divergent note edits remain recoverable. */
export function mergeStates(base: State, local: State, remote: State) {
  const state = structuredClone(remote), conflicts: NoteConflict[] = [];
  for (const key of ["theme", "difficulty", "subjects", "goal", "interests"] as const)
    Object.assign(state, { [key]: choose(base[key], local[key], remote[key]) });
  for (const key of ["name", "bio", "avatar"] as const)
    Object.assign(state.profile, { [key]: choose(base.profile[key], local.profile[key], remote.profile[key]) });
  if (local.profile.badges || remote.profile.badges) state.profile.badges = choose(base.profile.badges ?? [], local.profile.badges ?? [], remote.profile.badges ?? []);
  if (local.unlocked || remote.unlocked) state.unlocked = [...new Set([...(local.unlocked ?? []), ...(remote.unlocked ?? [])])];
  if (local.edgeReasons || remote.edgeReasons) {
    state.edgeReasons = {};
    for (const id of keys(base.edgeReasons ?? {}, local.edgeReasons ?? {}, remote.edgeReasons ?? {})) {
      const value = choose(base.edgeReasons?.[id], local.edgeReasons?.[id], remote.edgeReasons?.[id]);
      if (value !== undefined) state.edgeReasons[id] = value;
    }
  }
  state.saved = [...new Set([...base.saved, ...local.saved, ...remote.saved])].filter(id => choose(base.saved.includes(id), local.saved.includes(id), remote.saved.includes(id)));
  state.notes = {};
  for (const id of keys(base.notes, local.notes, remote.notes)) {
    const b = base.notes[id], l = local.notes[id], r = remote.notes[id];
    if (!equal(l, b) && !equal(r, b) && !equal(l, r)) conflicts.push({ id, local: l, remote: r });
    const value = choose(b, l, r);
    if (value !== undefined) state.notes[id] = value;
  }
  state.progress = {};
  for (const id of keys(base.progress, local.progress, remote.progress)) {
    const b = base.progress[id], l = local.progress[id], r = remote.progress[id];
    const value = choose(b, l, r);
    // The current chapter is a navigation choice; returning to an earlier one is intentional.
    if (value) state.progress[id] = l && r ? { ...value, section: b ? choose(b.section, l.section, r.section) : l.section, complete: l.complete || r.complete } : value;
  }
  state.seconds = {};
  for (const id of keys(local.seconds, remote.seconds)) state.seconds[id] = Math.max(local.seconds[id] ?? 0, remote.seconds[id] ?? 0);
  state.daily = { ...remote.daily, ...local.daily };
  const edgeMap = (s: State) => new Map(s.edges.map(e => [JSON.stringify([e.from, e.to, e.label]), e]));
  const b = edgeMap(base), l = edgeMap(local), r = edgeMap(remote);
  state.edges = [...new Set([...b.keys(), ...l.keys(), ...r.keys()])].filter(id => choose(b.has(id), l.has(id), r.has(id))).map(id => l.get(id) ?? r.get(id)!);
  return { state, conflicts };
}
export const emptyState = () => structuredClone(initialState);
