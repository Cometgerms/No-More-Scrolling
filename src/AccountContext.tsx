import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { LibraryStore } from "./library-store";
import { cloud } from "./cloud";
import { loadAccount, saveAccount, emptyRecord } from "./account-storage";
import { loadState, saveState } from "./storage";
import { supabase } from "./supabase";
import { useLanguage } from "./i18n";

const Context = createContext<LibraryStore | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [store] = useState(() => new LibraryStore({
    async load(id) { if (id) return loadAccount(id); const result = await loadState(); if (result.warning) throw new Error(result.warning); return { ...emptyRecord(), state: result.state }; },
    async save(id, record) { return id ? saveAccount(id, record) : saveState(record.state); },
  }, cloud));
  const [authError, setAuthError] = useState(false);
  useEffect(() => {
    let live = true;
    const callback = new URL(location.href);
    const callbackError = callback.searchParams.has("error") || new URLSearchParams(callback.hash.slice(1)).has("error");
    if (callbackError) {
      setAuthError(true);
      history.replaceState(null, "", `${import.meta.env.BASE_URL}#/you`);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase callbacks hold an auth lock; run queries only after returning.
      setTimeout(() => { if (live) { if (session) setAuthError(false); if (event === "PASSWORD_RECOVERY") location.hash = "#/you"; void store.activate(session?.user ?? null); } }, 0);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!live) return;
      if (error || (callback.searchParams.has("code") && !data.session)) setAuthError(true);
      if (callback.searchParams.has("code")) history.replaceState(null, "", `${import.meta.env.BASE_URL}#/you`);
      void store.activate(data.session?.user ?? null);
    }).catch(() => { if (live) { setAuthError(true); void store.activate(null); } });
    const sync = () => { if (navigator.onLine && !document.hidden) void store.sync(); };
    const interval = window.setInterval(sync, 15000);
    window.addEventListener("online", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { live = false; subscription.unsubscribe(); clearInterval(interval); window.removeEventListener("online", sync); window.removeEventListener("focus", sync); document.removeEventListener("visibilitychange", sync); };
  }, [store]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    if (snapshot.status !== "pending") return;
    const timer = setTimeout(() => { if (navigator.onLine) void store.sync(); }, 1500);
    return () => clearTimeout(timer);
  }, [snapshot.status, store]);
  if (!snapshot.ready) return <div className="loading"><h1>No More Scrolling</h1><p>{snapshot.error ? (language === "en" ? "Could not read local data. Your records have not been cleared." : "无法读取本地数据，原有记录未被清除。") : (language === "en" ? "Opening your library…" : "正在打开你的资料…")}</p><button className="secondary" onClick={() => location.reload()}>{language === "en" ? "Reload" : "重新加载"}</button></div>;
  return <Context.Provider value={store}>{authError && <div className="notice">{language === "en" ? "Sign-in could not be restored. Please sign in again." : "登录状态未能恢复，请重新登录。"}</div>}{children}</Context.Provider>;
}
export function useLibrary() {
  const store = useContext(Context);
  if (!store) throw new Error("AccountProvider missing");
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...snapshot, store };
}
