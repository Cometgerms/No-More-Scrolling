import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LanguageProvider, useLanguage } from "./i18n";
import "katex/dist/katex.min.css";
import "./styles.css";
import { AccountProvider } from "./AccountContext";
function LoadingError() {
  const { t } = useLanguage();
  return (
    <div className="empty">
      <h1>{t("这次加载遇到了问题。")}</h1>
      <p>{t("本地数据未被主动清除。请重新打开应用。")}</p>
      <button className="primary" onClick={() => location.reload()}>{t("重新加载")}</button>
    </div>
  );
}
class Boundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <LoadingError />
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <Boundary>
      <AccountProvider><App /></AccountProvider>
    </Boundary>
  </LanguageProvider>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })
      .then((reg) => {
        if (reg.waiting) window.dispatchEvent(new Event("nms-update-ready"));
        reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", () => {
            if (reg.waiting && navigator.serviceWorker.controller)
              window.dispatchEvent(new Event("nms-update-ready"));
          });
        });
      })
      .catch(() => {
        /* Offline install retried on next visit. */
      });
  });
  let refreshing = false;
  const wasControlled = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (wasControlled && !refreshing) {
      refreshing = true;
      location.reload();
    }
  });
}
