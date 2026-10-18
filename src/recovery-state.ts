let recovering = false;
try { recovering = sessionStorage.getItem("nms-password-recovery") === "1"; } catch { /* Memory-only fallback */ }
const listeners = new Set<() => void>();
export const recoveryState = {
  getSnapshot: () => recovering,
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  set(value: boolean) {
    recovering = value;
    try { if (value) sessionStorage.setItem("nms-password-recovery", "1"); else sessionStorage.removeItem("nms-password-recovery"); } catch { /* No password is stored here. */ }
    listeners.forEach(fn => fn());
  },
};
