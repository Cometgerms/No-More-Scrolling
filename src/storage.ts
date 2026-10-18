import { openDB } from "idb";
import { initialState, type State } from "./model";
import { validateState } from "./logic";
const KEY = "nms-state-v1";
const db = () =>
  openDB("no-more-scrolling", 1, {
    upgrade(db) {
      db.createObjectStore("state");
    },
  });
export async function loadState(): Promise<{ state: State; warning?: string }> {
  let localFailed = false;
  try {
    const local = localStorage.getItem(KEY);
    if (local) return { state: validateState(JSON.parse(local)) };
  } catch {
    localFailed = true;
  }
  try {
    const saved = await (await db()).get("state", KEY);
    return {
      state: saved ? validateState(saved) : structuredClone(initialState),
      ...(localFailed && !saved
        ? { warning: "部分本地记录无法读取，请检查备份。" }
        : {}),
    };
  } catch {
    return {
      state: structuredClone(initialState),
      warning:
        "无法读取本地记录。当前可继续使用；请检查浏览器存储权限并保留导出备份。",
    };
  }
}
let pending = Promise.resolve();
export function saveState(state: State): Promise<boolean> {
  let localOk = false;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localOk = true;
  } catch {
    /* IndexedDB fallback */
  }
  const job = pending.then(async () => {
    try {
      await (await db()).put("state", state, KEY);
      return true;
    } catch {
      return localOk;
    }
  });
  pending = job.then(() => {});
  return job;
}
