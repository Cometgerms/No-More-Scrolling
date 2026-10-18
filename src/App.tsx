import { version } from "../package.json";
import { useLanguage, useContent } from "./i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FlaskConical,
  Grid2X2,
  Link2,
  Moon,
  Pause,
  Play,
  Search,
  Settings2,
  Sun,
  Upload,
  X,
} from "lucide-react";
import {
  SUBJECTS,
  initialState,
  type State,
  type Subject,
  type Article,
  type Feedback,
} from "./model";
import { dailySelection, localDate, validateState } from "./logic";
import { useLibrary } from "./AccountContext";
import { AccountPanel } from "./AccountPanel";
import { Prose, RichText } from "./Math";
import { Lab } from "./Labs";
import { Graph } from "./Graph";
import { SummarySettings } from "./SummarySettings";
import { SubjectIcon } from "./ProfileArt";
import { Profile } from "./Profile";
import { Rickroll } from "./Rickroll";
import { World } from "./World";
import { Assistant, AssistantProvider, AssistantSettings } from "./Assistant";
const navItems = [
  { id: "today", label: "今日", en: "Today", icon: Grid2X2 },
  { id: "explore", label: "探索", en: "Explore", icon: Compass },
  { id: "world", label: "世界", en: "World", icon: Compass },
  { id: "saved", label: "收藏", en: "Collection", icon: Bookmark },
  { id: "you", label: "我的", en: "You", icon: Settings2 },
];
function route() {
  return location.hash.slice(2) || "today";
}
function navigate(path: string) {
  location.hash = "/" + path;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function Art({ kind, large = false }: { kind: Subject; large?: boolean }) {
  return (
    <svg
      className={`card-art ${large ? "large" : ""}`}
      viewBox="0 0 260 160"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fade-${kind}-${large}`}>
          <stop stopColor="currentColor" stopOpacity=".65" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".05" />
        </linearGradient>
      </defs>
      {kind === "math" ? (
        <g fill="none" stroke="currentColor">
          <ellipse
            cx="132"
            cy="78"
            rx="87"
            ry="43"
            transform="rotate(-28 132 78)"
            opacity=".45"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse
              key={i}
              cx="132"
              cy="78"
              rx={30 + i * 12}
              ry="61"
              transform={`rotate(${i * 24 - 48} 132 78)`}
              opacity={0.14 + i * 0.09}
            />
          ))}
          <circle cx="195" cy="46" r="5" fill="currentColor" />
          <path d="M22 134H233" opacity=".25" />
          <text
            x="23"
            y="116"
            stroke="none"
            fill="currentColor"
            fontSize="18"
            fontFamily="Georgia,serif"
          >
            μ({`{x}`}) = 0
          </text>
        </g>
      ) : kind === "cs" ? (
        <g stroke="currentColor" fill="none">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={45 + i * 45}
                y={30 + i * 17}
                width="73"
                height="55"
                rx="7"
                opacity={0.3 + i * 0.2}
              />
              <path
                d={`M${58 + i * 45} ${48 + i * 17}h19m-19 10h37`}
                opacity=".7"
              />
            </g>
          ))}
          <path d="M36 118h135l22-22" strokeDasharray="4 5" opacity=".45" />
        </g>
      ) : kind === "history" ? (
        <g fill="none" stroke="currentColor">
          <path d="M47 126H220M58 115H209M65 55l68-28 69 28z" opacity=".65" />
          {[75, 110, 145, 180].map((x) => (
            <g key={x}>
              <path d={`M${x} 62v44m9-44v44`} opacity=".55" />
              <path d={`M${x - 3} 60h16m-16 48h16`} opacity=".8" />
            </g>
          ))}
          <circle cx="198" cy="38" r="26" opacity=".13" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor">
          <path d="M130 34L201 119H59Z" opacity=".45" />
          {[
            [130, 34, "A"],
            [201, 119, "B"],
            [59, 119, "C"],
          ].map(([x, y, label]) => (
            <g key={label}>
              <circle cx={x} cy={y} r="22" fill="var(--panel)" />
              <text
                x={x}
                y={Number(y) + 6}
                textAnchor="middle"
                fill="currentColor"
                stroke="none"
                fontSize="17"
              >
                {label}
              </text>
            </g>
          ))}
          <path d="m175 72 3 12-12-3m-35 45-10-7 10-6m-36-41 9-7 0 12" />
        </g>
      )}
    </svg>
  );
}
function ArticleCard({
  article: a,
  featured = false,
  state,
  open,
}: {
  article: Article;
  featured?: boolean;
  state: State;
  open: (id: string) => void;
}) {
  const { t } = useLanguage();

  const sub = SUBJECTS[a.subject];
  return (
    <button
      className={`discovery-card ${featured ? "featured" : ""}`}
      style={{ "--subject": sub.color } as React.CSSProperties}
      onClick={() => open(a.id)}
    >
      <div className="card-top">
        <span className="subject-label">
          <i><SubjectIcon subject={a.subject} /></i>
          {sub.en}
        </span>
        <span className="card-status">
          {state.progress[a.id]?.complete ? (
            <Check size={16} />
          ) : (
            <ArrowUpRight size={19} />
          )}
        </span>
      </div>
      <Art kind={a.subject} large={featured} />
      <div className="card-copy">
        <span className="card-kicker">
          {a.difficulty === 3 ? "DEEP DIVE" : "CORE EXPLORATION"}
        </span>
        <h2>{a.title}</h2>
        <p>{a.subtitle}</p>
        <div className="card-meta">
          <span>
            <Clock size={13} />
            {a.minutes} MIN
          </span>
          <span>
            {state.progress[a.id]?.complete
              ? t("已探索")
              : state.progress[a.id]
                ? t("继续探索")
                : t("互动探索")}
          </span>
          {state.saved.includes(a.id) && <Bookmark size={13} />}
        </div>
      </div>
    </button>
  );
}
export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const { articles, concepts } = useContent();

  const { state, ready, store, owner, conflicts, error: storageError } = useLibrary();
  const setState = store.update;
  const warning = storageError === "save" ? "保存失败：本地存储不可用。请及时导出备份。" : "";
  const [path, setPath] = useState(route),
    [today, setToday] = useState(localDate),
    [selected, setSelected] = useState("measure"),
    [tracking, setTracking] = useState(true),
    [toast, setToast] = useState(""),
    [offline, setOffline] = useState(!navigator.onLine),
    [updateReady, setUpdateReady] = useState(false),
    [updating, setUpdating] = useState(false);
  const lastActive = useRef(Date.now()),
    fileInput = useRef<HTMLInputElement>(null);
  const reader = path.startsWith("read/"),
    article = reader ? articles.find((a) => a.id === path.slice(5)) : undefined;
  const tab = reader ? "today" : path;
  const update = useCallback((fn: (s: State) => State) => setState(fn), []);
  const notify = (msg: string) => setToast(msg);
  useEffect(() => {
    const listener = () => {
      setPath(route());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)"),
      apply = () => {
        const mode =
          state.theme === "system"
            ? media.matches
              ? "dark"
              : "light"
            : state.theme;
        document.documentElement.dataset.theme = mode;
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute("content", mode === "dark" ? "#101410" : "#f5f5ee");
      };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [state.theme]);
  useEffect(() => {
    const active = () => (lastActive.current = Date.now());
    for (const event of ["pointerdown", "keydown", "scroll", "touchstart"])
      window.addEventListener(event, active, { passive: true });
    return () => {
      for (const event of ["pointerdown", "keydown", "scroll", "touchstart"])
        window.removeEventListener(event, active);
    };
  }, []);
  useEffect(() => {
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const day = localDate();
      setToday(day);
      if (
        ready &&
        tracking &&
        !document.hidden &&
        (reader || tab === "explore") &&
        now - lastActive.current < 60000
      ) {
        const seconds = Math.min(5, (now - last) / 1000);
        setState((s) => ({
          ...s,
          seconds: { ...s.seconds, [day]: (s.seconds[day] ?? 0) + seconds },
        }));
      }
      last = now;
    };
    const timer = setInterval(tick, 5000);
    const visibility = () => {
      last = Date.now();
      setToday(localDate());
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ready, tracking, reader, tab]);
  useEffect(() => {
    if (!ready) return;
    setState((s) =>
      s.daily[today]
        ? s
        : { ...s, daily: { ...s.daily, [today]: dailySelection(today, s) } },
    );
  }, [ready, today]);
  useEffect(() => {
    const on = () => setOffline(false),
      off = () => setOffline(true),
      sw = () => setUpdateReady(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("nms-update-ready", sw);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("nms-update-ready", sw);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const toggleSave = (id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id)
        ? s.saved.filter((x) => x !== id)
        : [...s.saved, id],
    }));
  };
  const open = (id: string) => {
    setState((s) =>
      s.progress[id]
        ? s
        : {
            ...s,
            progress: { ...s.progress, [id]: { section: 0, complete: false } },
          },
    );
    navigate("read/" + id);
  };
  const focusConcept = (id: string) => {
    setSelected(id);
    navigate("explore");
  };
  async function exportBackup() {
    const blob = new Blob(
        [
          JSON.stringify(
            { ...state, syncConflicts: conflicts, exportedAt: new Date().toISOString() },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `no-more-scrolling-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    notify(t("备份已生成，请保存到“文件”。"));
  }
  async function importBackup(file: File) {
    try {
      if (file.size > 5_000_000) throw new Error(t("备份文件超过 5 MB"));
      const next = validateState(JSON.parse(await file.text()));
      if (!confirm(t("恢复备份会替换当前收藏、笔记与记录。确定继续？"))) return;
      setState(next);
      notify(t("备份已恢复。"));
    } catch (e) {
      notify(e instanceof Error ? e.message : t("无法读取备份"));
    }
  }
  const ids = state.daily[today] ?? dailySelection(today, state),
    daily = ids
      .map((id) => articles.find((a) => a.id === id)!)
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(state.subjects.includes(b.subject)) -
          Number(state.subjects.includes(a.subject)),
      ),
    minutes = Math.floor((state.seconds[today] ?? 0) / 60),
    done = ids.filter((id) => state.progress[id]?.complete).length;
  if (!ready)
    return (
      <div className="loading">
        <div className="brand-mark">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        </div>
        <p>{language === "en" ? "Loading…" : "加载中…"}</p>
      </div>
    );
  return (
    <AssistantProvider><div className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          onClick={() => navigate("today")}
          aria-label={t("No More Scrolling 首页")}
        >
          <span className="brand-mark">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          </span>
          <span>
            NO MORE
            <br />
            SCROLLING<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="header-right">
          <span className="edition">v{version}</span><span id="ai-launcher-slot" />
          <button
            className="language-toggle"
            aria-label={t("切换语言")}
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
          >
            {language === "zh" ? "EN" : "中文"}
          </button>

        </div>
      </header>
      {(warning || offline) && (
        <div className="notice">
          {warning ? t(warning) : t("离线模式 · 已缓存的文章、互动与笔记仍可使用。")}
        </div>
      )}
      {updateReady && (
        <div className="notice">{t("新版本已准备好。")}<button
            disabled={updating}
            onClick={async () => {
              setUpdating(true);
              try {
                if (!await store.persist()) throw new Error("Save failed");
                const reg = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
                if (!reg?.waiting) throw new Error("Update unavailable");
                reg.waiting.postMessage("SKIP_WAITING");
                window.setTimeout(() => {
                  setUpdating(false);
                  notify("更新未完成，请保持联网后重试。");
                }, 15000);
              } catch {
                setUpdating(false);
                notify("更新未完成，请保持联网后重试。");
              }
            }}
          >{t(updating ? "正在更新…" : "更新应用")}</button>
        </div>
      )}
      <main key={path}>
        {article ? (
          <Reader
            article={article}
            state={state}
            update={update}
            toggleSave={toggleSave}
            concept={focusConcept}
            open={open}
          />
        ) : reader ? (
          <div className="empty">
            <h1>{t("这篇文章不存在")}</h1>
            <button className="primary" onClick={() => navigate("today")}>{t("回到今日")}</button>
          </div>
        ) : tab === "today" ? (
          <>
            <section className="welcome">
              <div className="today-date">
                <span className="live-dot" />
                {new Date()
                  .toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                  .toUpperCase()}
                <span className="date-rule" />
              </div>
              <h1>{t("少刷一点。")}<br />
                <span>{t("多想一点。")}</span>
                <Rickroll onUnlock={() => { if (!state.unlocked?.includes("rickroll")) { update(s => ({ ...s, unlocked: [...new Set([...(s.unlocked ?? []), "rickroll"])] })); notify(language === "en" ? "Achievement unlocked · Never Gonna Give You Up" : "成就解锁 · Never Gonna Give You Up"); } }} />
              </h1>

            </section>
            <div className="daily-check">
              <div
                className="time-ring"
                style={
                  {
                    "--progress": `${Math.min(100, (minutes / state.goal) * 100)}%`,
                  } as React.CSSProperties
                }
              >
                <Clock size={19} />
              </div>
              <div>
                <strong>{t("今日探索")}{" "}
                  <span>
                    {minutes}
                    <small> / {state.goal} min</small>
                  </span>
                </strong>
                <p>
                  {minutes >= state.goal
                    ? (language === "en" ? "Daily goal reached." : "已完成今日目标。")
                    : (language === "en" ? "Reading time today." : "今日累计阅读时间。")}
                </p>
              </div>
              <button
                className="icon-button"
                aria-label={tracking ? t("暂停探索计时") : t("继续探索计时")}
                onClick={() => setTracking((t) => !t)}
              >
                {tracking ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
            <div className="section-heading">
              <h2>{t("今日四选")}<span>DAILY PICKS</span>
              </h2>
              <span className="count">{done} / 4</span>
            </div>
            <div className="discovery-grid">
              {daily.map((a, i) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  featured={i === 0}
                  state={state}
                  open={open}
                />
              ))}
            </div>
            <p className="hint">{language === "en" ? "End of today’s picks." : "今日推荐已结束。"}</p>
            <button
              className="graph-teaser"
              onClick={() => navigate("explore")}
            >
              <div>
                <span className="eyebrow">FOLLOW THE CONNECTIONS</span>
                <h3>{language === "en" ? "Knowledge graph" : "知识图谱"}</h3>
                <p>
                  {concepts.length} {t("个概念 ·")} {state.edges.length} {t("条个人关联")}</p>
              </div>
              <Link2 size={26} />
              <ArrowRight size={20} />
            </button>
            <details className="library-browser">
              <summary>{t("浏览全部")} {articles.length} {t("篇精选内容")}</summary>
              {articles.map((a) => (
                <button
                  key={a.id}
                  className="related-article"
                  onClick={() => open(a.id)}
                >
                  <span>
                    {a.title}
                    <small>
                      {t(SUBJECTS[a.subject].name)} · {a.minutes} MIN
                    </small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </details>
            <p className="tiny-note">{t("每天按本地日期选取。首批 8 篇轮换，旧篇会重现；全新内容随版本发布。")}</p>
          </>
        ) : tab === "explore" ? (
          <Graph
            state={state}
            update={update}
            open={open}
            selected={selected}
            setSelected={setSelected}
          />
        ) : tab === "world" ? <World /> : tab === "saved" ? (
          <Collection
            state={state}
            open={open}
            concept={focusConcept}
            toggleSave={toggleSave}
          />
        ) : tab === "you" ? <Profile state={state} update={update} cloud={!!owner}><AccountPanel /></Profile> : (
          <>
            <div className="page-heading">
              <a className="text-button" href="#/you">← {language === "en" ? "Profile" : "个人资料"}</a><h1>{language === "en" ? "Settings" : "设置"}</h1>
            </div>
            <AssistantSettings /><SummarySettings />
            <section className="settings-section">
              <h2>Daily time check</h2>
              <p>{t("仅在阅读和图谱页面记录，锁屏或后台暂停；60 秒无操作后暂停。时间是近似记录。")}</p>
              <div className="segmented">
                {[5, 10, 15].map((g) => (
                  <button
                    key={g}
                    className={state.goal === g ? "active" : ""}
                    onClick={() => setState((s) => ({ ...s, goal: g }))}
                  >
                    {g} {t("分钟")}</button>
                ))}
              </div>
              <div className="week-bars">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 6 + i);
                  const dateKey = localDate(date),
                    min = Math.floor((state.seconds[dateKey] ?? 0) / 60);
                  return (
                    <div key={dateKey}>
                      <span>{min}m</span>
                      <i
                        style={{ height: Math.max(3, Math.min(70, min * 4)) }}
                      />
                      <small>
                        {date
                          .toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { weekday: "short" })}
                      </small>
                    </div>
                  );
                })}
              </div>
              <button
                className="secondary"
                onClick={() => setTracking((v) => !v)}
              >
                {tracking ? <Pause size={16} /> : <Play size={16} />}{" "}
                {tracking ? t("暂停计时") : t("继续计时")}
              </button>
            </section>
            <section className="settings-section">
              <h2>{t("兴趣与深度")}</h2>
              <p>{t("偏好科目会排在首页前面，每天仍保留四科学科入口。内容选择设置次日生效。")}</p>
              <div className="filter-row">
                {Object.entries(SUBJECTS).map(([key, v]) => (
                  <button
                    key={key}
                    className={
                      state.subjects.includes(key as Subject)
                        ? "chip active"
                        : "chip"
                    }
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        subjects: s.subjects.includes(key as Subject)
                          ? s.subjects.filter((x) => x !== key)
                          : [...s.subjects, key as Subject],
                      }))
                    }
                  >
                    <SubjectIcon subject={key as Subject} size={18} /> {t(v.name)}
                  </button>
                ))}
              </div>
              <label className="field-label">{t("数学 / CS 深度")}<select
                  value={state.difficulty}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      difficulty: +e.target.value as 2 | 3,
                    }))
                  }
                >
                  <option value="2">{t("Core · 本科基础之上的探索")}</option>
                  <option value="3">{t("Deep · 更重证明与抽象结构")}</option>
                </select>
              </label>
              <label className="field-label">{t("最近对什么感兴趣？")}<textarea
                  value={state.interests}
                  maxLength={2000}
                  onChange={(e) =>
                    setState((s) => ({ ...s, interests: e.target.value }))
                  }
                  placeholder={t("Galois theory, distributed systems, 政治经济学…")}
                />
              </label>
              <p className="hint">{t("关键词会参与本地选题；仅能匹配已有内容，不会自动生成新文章或读取聊天记录。")}</p>
            </section>
            <section className="settings-section">
              <h2>{t("语言 / Language")}</h2>
              <div className="segmented" aria-label={t("选择语言")}>
                <button className={language === "zh" ? "active" : ""} aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
                <button className={language === "en" ? "active" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
              </div>
              <p>{t("界面、文章和互动支持中英文切换，公式保持一致。笔记与个人关联保留你的原文。")}</p>
            </section>
            <section className="settings-section">
              <h2>{t("外观")}</h2>
              <div className="segmented">
                {[
                  ["dark", t("深色")],
                  ["light", t("浅色")],
                  ["system", t("跟随系统")],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={state.theme === key ? "active" : ""}
                    onClick={() =>
                      setState((s) => ({ ...s, theme: key as State["theme"] }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
            <section className="settings-section">
              <h2>{t("你的数据，在你手里。")}</h2>
              <p>{language === "en" ? "Guest records stay on this device. When signed in, your account library syncs with Supabase. Keep an exported backup before clearing website data." : "访客记录保存在本机；登录后的账号资料会同步到 Supabase。清理网站数据前，请导出备份。"}</p>
              <div className="button-row">
                <button className="secondary" onClick={exportBackup}>
                  <Download size={17} />{t("导出备份")}</button>
                <button
                  className="secondary"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload size={17} />{t("恢复备份")}</button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importBackup(f);
                  e.target.value = "";
                }}
              />
            </section>
            <section className="settings-section">
              <h2>{t("在 iPhone 上使用")}</h2>
              <ol>
                <li>{t("用 Safari 打开本应用的网址。")}</li>
                <li>{t("点“分享”，选择“添加到主屏幕”。")}</li>
                <li>{t("如果出现“作为 Web App 打开”，保持开启。")}</li>
                <li>{t("首次联网打开后，等页面加载完毕，再用飞行模式测试离线阅读。")}</li>
              </ol>
              <p className="hint">{t("Safari 与主屏幕应用的存储环境可能不同；若未看到原记录，可用导出 / 恢复迁移。外部来源链接需要联网。")}</p>
              <button
                className="secondary"
                onClick={async () => {
                  if (!("serviceWorker" in navigator)) {
                    notify(t("当前浏览器不支持离线更新。"));
                    return;
                  }
                  try {
                    const r = await navigator.serviceWorker.getRegistration();
                    if (r) {
                      await r.update();
                      notify(
                        r.waiting
                          ? t("已有更新，点击顶部更新应用。")
                          : t("已检查版本；若有更新会在顶部提示。"),
                      );
                    } else notify(t("离线组件尚未就绪，请联网重新打开。"));
                  } catch {
                    notify(t("检查失败，请联网后重试。"));
                  }
                }}
              >
                <ArrowDownToLine size={17} />{t("检查应用更新")}</button>
            </section>
            <footer className="about-footer">
              NO MORE SCROLLING · v0.1.0
              <br />
              <a
                href="https://github.com/Cometgerms/No-More-Scrolling"
                target="_blank"
                rel="noreferrer"
              >{t("查看开源项目 ↗")}</a>

            </footer>
          </>
        )}
      </main>
      <Assistant page={article ? {
        id: path,
        title: `${article.title} · ${(state.progress[article.id]?.section ?? 0) + 1}/${article.sections.length}`,
        text: JSON.stringify({ title: article.title, section: article.sections[state.progress[article.id]?.section ?? 0], lab: (state.progress[article.id]?.section ?? 0) === 2 ? article.labIntro : undefined, sources: article.sources }),
      } : { id: tab, title: language === "en" ? (navItems.find(n => n.id === tab)?.en ?? "Page") : (navItems.find(n => n.id === tab)?.label ?? "页面"), text: tab === "explore" ? JSON.stringify(concepts.find(c => c.id === selected)) ?? "" : tab === "today" ? daily.map(a => `${a.title}: ${a.question}`).join("\n") : "" }} />
      <nav className="bottom-nav" aria-label={t("主导航")}>
        {navItems.map(({ id, label, en, icon: Icon }) => (
          <button
            key={id}
            aria-current={tab === id || (tab === "settings" && id === "you") ? "page" : undefined}
            className={tab === id || (tab === "settings" && id === "you") ? "active" : ""}
            onClick={() => navigate(id)}
          >
            <Icon size={21} />
            <span>
              {t(label)}
              {language === "zh" && <small>{en}</small>}
            </span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          {t(toast)}
        </div>
      )}
    </div></AssistantProvider>
  );
}
function Reader({
  article: a,
  state,
  update,
  toggleSave,
  concept,
  open,
}: {
  article: Article;
  state: State;
  update: (fn: (s: State) => State) => void;
  toggleSave: (id: string) => void;
  concept: (id: string) => void;
  open: (id: string) => void;
}) {
  const { t, language } = useLanguage();
  const { articles, concepts } = useContent();

  const progress = state.progress[a.id] ?? { section: 0, complete: false };
  const section = progress.section,
    last = section === a.sections.length - 1;
  const sub = SUBJECTS[a.subject];
  const move = (index: number) => {
    update((s) => ({
      ...s,
      progress: { ...s.progress, [a.id]: { ...progress, section: index } },
    }));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const answer = (i: number) =>
    update((s) => ({
      ...s,
      progress: { ...s.progress, [a.id]: { ...progress, answer: i } },
    }));
  const [deep, setDeep] = useState(false);
  return (
    <article
      className="reader"
      style={{ "--subject": sub.color } as React.CSSProperties}
    >
      <div className="reader-toolbar">
        <button className="text-button" onClick={() => navigate("today")}>
          <ArrowLeft size={17} />{t("返回探索")}</button>
        <button
          className={`icon-button ${state.saved.includes(a.id) ? "selected" : ""}`}
          aria-label={state.saved.includes(a.id) ? t("取消收藏文章") : t("收藏文章")}
          onClick={() => toggleSave(a.id)}
        >
          <Bookmark
            size={21}
            fill={state.saved.includes(a.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="reading-progress">
        {a.sections.map((s, i) => (
          <button
            key={s.title}
            className={i <= section ? "done" : ""}
            aria-label={t("跳至第{0}节：{1}", i + 1, s.title)}
            aria-current={i === section ? "step" : undefined}
            onClick={() => move(i)}
          />
        ))}
      </div>
      <div className="reader-heading">
        <span className="subject-label">
          <i><SubjectIcon subject={a.subject} /></i>
          {sub.en}{" "}
          <span>
            · {section + 1}/{a.sections.length}
          </span>
        </span>
        <h1>{a.title}</h1>
        <p>{a.question}</p>
        <div className="card-meta">
          <span>
            <Clock size={14} />
            {a.minutes} MIN
          </span>
          <span>{a.difficulty === 3 ? "DEEP DIVE" : "CORE EXPLORATION"}</span>
        </div>
      </div>
      {section === 0 && (
        <>
          <Art kind={a.subject} large />
          <details className="prerequisites">
            <summary>{t("前置知识 ·")} {a.prerequisites.join(" / ")}</summary>
            <p>{t("默认已接触")} {a.prerequisites.join(` ${t("与")} `)}{t("。遇到不熟悉的概念，可以点击文末关联节点，查看概念说明与相关文章。")}</p>
          </details>
        </>
      )}
      <div data-chat-fragment><Prose key={`${a.id}-${section}`} section={a.sections[section]} />
      {section === 2 && <Lab key={a.id} article={a} />}</div>
      {last && (
        <>
          <button
            className="deep-toggle"
            aria-expanded={deep}
            onClick={() => setDeep((v) => !v)}
          >
            <span>
              <FlaskConical size={20} />
              {deep ? t("收起深入解释") : t("再往深处走一步")}
              <small>OPTIONAL DEEPER DIVE</small>
            </span>
            <span>{deep ? "−" : "+"}</span>
          </button>
          {deep && <div data-chat-fragment><Prose section={a.deep} /></div>}
          <section className="quiz">
            <span className="eyebrow">CHECK YOUR INTUITION</span>
            <h2>{t("把这个想法带走。")}</h2>
            <p><RichText value={a.quiz.question} /></p>
            <div className="choices">
              {a.quiz.options.map((option, i) => (
                <button
                  key={option}
                  className={
                    progress.answer === i
                      ? i === a.quiz.answer
                        ? "correct"
                        : "incorrect"
                      : ""
                  }
                  onClick={() => answer(i)}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  <span className="choice-copy"><RichText value={option} /></span>
                  {progress.answer === i && i === a.quiz.answer && (
                    <Check size={17} />
                  )}
                </button>
              ))}
            </div>
            {progress.answer !== undefined && (
              <p className="result" role="status">
                <RichText value={a.quiz.explanations[progress.answer]} />
              </p>
            )}
          </section>
          <label className="field-label article-note">{t("留给未来的自己")}<textarea
              value={state.notes[a.id] ?? ""}
              maxLength={20000}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  notes: { ...s.notes, [a.id]: e.target.value },
                }))
              }
              placeholder={t("哪个瞬间让你理解了？还有什么疑问？")}
            />
          </label>
          <div className="feedback">
            <span className="eyebrow">{t("这次探索怎么样？")}</span>
            <div className="filter-row">
              {(
                [
                  ["interesting", t("有意思")],
                  ["basic", t("太基础")],
                  ["hard", t("太难")],
                  ["skip", t("不感兴趣")],
                ] as [Feedback, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={progress.feedback === key ? "chip active" : "chip"}
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      progress: {
                        ...s.progress,
                        [a.id]: { ...progress, feedback: key },
                      },
                    }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {progress.feedback && (
              <p className="hint">
                {progress.feedback === "skip"
                  ? t("会降低这篇文章在后续选题中的优先级。")
                  : progress.feedback === "basic"
                    ? t("已记录。可在“我的”中将深度调为 Deep。")
                    : progress.feedback === "hard"
                      ? t("已记录。可以先探索前置概念，或将深度调为 Core。")
                      : t("已记录这份兴趣。关联概念在下面，继续沿着它探索。")}
              </p>
            )}
          </div>
          <section className="reader-concepts">
            <span className="eyebrow">CONNECT THE DOTS</span>
            <h2>{t("故事，还能往这里走。")}</h2>
            {a.concepts.map((id) => {
              const node = concepts.find((c) => c.id === id)!;
              return (
                <div key={id}>
                  <button onClick={() => concept(id)}>
                    <span>
                      {node.name}
                      {language === "zh" && <small>{node.zh}</small>}
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                  <button
                    className={`icon-button ${state.saved.includes(id) ? "selected" : ""}`}
                    aria-label={t("收藏 {0}", node.name)}
                    onClick={() => toggleSave(id)}
                  >
                    <Bookmark
                      size={17}
                      fill={state.saved.includes(id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              );
            })}
          </section>
          <details className="sources">
            <summary>{t("Sources & verification · 来源与核验")}</summary>
            <p>
              {a.contentType === "theorem"
                ? t("数学 / 形式论证")
                : a.contentType === "formal-model"
                  ? t("理论模型，非现实民调")
                  : t("历史事实与分析已在正文区分")}{" "}{t("· 发布")} {a.publishedAt} {t("· 核对")} {a.verifiedAt}
            </p>
            <p>{a.verification}</p>
            {a.sources.map((source) => (
              <div key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} ↗
                </a>
                <p>{source.note}</p>
              </div>
            ))}
          </details>
          <button
            className="primary finish"
            onClick={() => {
              update((s) => ({
                ...s,
                progress: {
                  ...s.progress,
                  [a.id]: { ...progress, complete: true },
                },
              }));
              navigate("today");
            }}
          >
            {progress.complete
              ? t("回到今日探索")
              : progress.answer === undefined
                ? t("结束探索 · 暂时跳过题目")
                : t("完成这次探索")}
            <Check size={18} />
          </button>
          <p className="hint center">{t("完成表示已探索，不代表已掌握。")}</p>
        </>
      )}
      <div className="reader-navigation">
        <button
          className="secondary"
          disabled={section === 0}
          onClick={() => move(section - 1)}
        >
          <ArrowLeft size={17} />{t("上一节")}</button>
        {!last ? (
          <button className="primary" onClick={() => move(section + 1)}>{t("继续故事")}<ArrowRight size={17} />
          </button>
        ) : (
          <button
            className="secondary"
            onClick={() =>
              open(
                articles.find((x) => x.subject === a.subject && x.id !== a.id)!
                  .id,
              )
            }
          >{t("同科下一篇")}<ArrowUpRight size={17} />
          </button>
        )}
      </div>
    </article>
  );
}
function Collection({
  state,
  open,
  concept,
  toggleSave,
}: {
  state: State;
  open: (id: string) => void;
  concept: (id: string) => void;
  toggleSave: (id: string) => void;
}) {
  const { t, language } = useLanguage();
  const { articles, concepts } = useContent();

  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const savedArticles = articles.filter(
      (a) =>
        (state.saved.includes(a.id) || !!state.notes[a.id]) &&
        (a.title + " " + a.subtitle)
          .toLowerCase()
          .includes(query.toLowerCase()),
    ),
    savedConcepts = concepts.filter(
      (c) =>
        (state.saved.includes(c.id) || !!state.notes[c.id]) &&
        (c.name + " " + c.zh).toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">THINGS WORTH KEEPING</span>
        <h1>{language === "en" ? "Collection" : "收藏"}</h1>

      </div>
      <div className="search">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("搜索收藏")}
          placeholder={t("搜索收藏的文章与概念…")}
        />
      </div>
      <div className="filter-row">
        {[
          ["all", t("全部")],
          ["articles", t("文章")],
          ["concepts", t("知识点")],
        ].map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "chip active" : "chip"}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {savedArticles.length === 0 && savedConcepts.length === 0 ? (
        <div className="empty">
          <Bookmark size={36} />
          <h2>{t("收藏第一个好问题。")}</h2>
          <p>{t("文章和图谱里的书签，会把发现保存在这里。写过笔记的内容也会出现。")}</p>
          <button className="primary" onClick={() => navigate("today")}>{t("开始今天的探索")}<ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          {filter !== "concepts" &&
            savedArticles.map((a) => (
              <div className="saved-item" key={a.id}>
                <button onClick={() => open(a.id)}>
                  <span className="eyebrow">
                    {SUBJECTS[a.subject].en} · ARTICLE
                  </span>
                  <h3>{a.title}</h3>
                  <p>{state.notes[a.id] || a.subtitle}</p>
                </button>
                <button
                  className="icon-button"
                  aria-label={t("切换收藏 {0}", a.title)}
                  onClick={() => toggleSave(a.id)}
                >
                  <Bookmark
                    size={18}
                    fill={state.saved.includes(a.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
            ))}
          {filter !== "articles" &&
            savedConcepts.map((c) => (
              <div className="saved-item" key={c.id}>
                <button onClick={() => concept(c.id)}>
                  <span className="eyebrow">CONCEPT · {c.zh}</span>
                  <h3>{c.name}</h3>
                  <p>{state.notes[c.id] || c.description}</p>
                </button>
                <button
                  className="icon-button"
                  aria-label={t("切换收藏 {0}", c.name)}
                  onClick={() => toggleSave(c.id)}
                >
                  <Bookmark
                    size={18}
                    fill={state.saved.includes(c.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
            ))}
        </>
      )}
    </>
  );
}
