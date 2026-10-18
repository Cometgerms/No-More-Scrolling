import { useLanguage, useContent } from "./i18n";
import { useRef, useState } from "react";
import {
  Bookmark,
  Plus,
  Minus,
  RotateCcw,
  ArrowUpRight,
  Search,
  Link2,
} from "lucide-react";
import { SUBJECTS, type State, type Subject } from "./model";
const positions: Record<string, [number, number]> = {
  measure: [160, 90],
  countable: [350, 70],
  cantor: [135, 230],
  diagonal: [335, 220],
  halting: [470, 330],
  decidability: [340, 440],
  cache: [90, 425],
  modular: [80, 570],
  bank: [215, 680],
  credit: [415, 670],
  causal: [110, 800],
  voting: [470, 90],
  relation: [480, 530],
  agenda: [430, 830],
};
export function Graph({
  state,
  update,
  open,
  selected,
  setSelected,
}: {
  state: State;
  update: (fn: (s: State) => State) => void;
  open: (id: string) => void;
  selected: string;
  setSelected: (id: string) => void;
}) {
  const { t, language } = useLanguage();
  const { concepts, edges, articles } = useContent();

  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<Subject | "all">("all"),
    [savedOnly, setSavedOnly] = useState(false),
    [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 }),
    [linking, setLinking] = useState(false),
    [target, setTarget] = useState(""),
    [label, setLabel] = useState("");
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const svg = useRef<SVGSVGElement>(null);
  const allEdges = [...edges, ...state.edges],
    focus = concepts.find((c) => c.id === selected) ?? concepts[0];
  const near = new Set([
    focus.id,
    ...allEdges
      .filter((e) => e.from === focus.id || e.to === focus.id)
      .flatMap((e) => [e.from, e.to]),
  ]);
  const filtered = concepts.filter(
    (c) =>
      (filter === "all" || c.subject === filter) &&
      (!savedOnly || state.saved.includes(c.id)) &&
      (c.name + " " + c.zh).toLowerCase().includes(query.toLowerCase()),
  );
  const visible = new Set(filtered.map((c) => c.id));
  function choose(id: string) {
    setSelected(id);
    setLinking(false);
    setTarget("");
    setLabel("");
  }
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR CONNECTED MIND</span>
        <h1>{language === "en" ? "Knowledge graph" : "知识图谱"}</h1>
        <p>{t("每一条连线，都是一个新的为什么。")}</p>
      </div>
      <div className="search">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("搜索概念 · measure, 投票…")}
          aria-label={t("搜索知识图谱")}
        />
      </div>
      <div className="filter-row">
        <button
          className={filter === "all" ? "chip active" : "chip"}
          onClick={() => setFilter("all")}
        >{t("全部")}</button>
        {Object.entries(SUBJECTS).map(([key, s]) => (
          <button
            key={key}
            className={filter === key ? "chip active" : "chip"}
            onClick={() => setFilter(key as Subject)}
          >
            {t(s.name)}
          </button>
        ))}
        <button
          className={savedOnly ? "chip active" : "chip"}
          onClick={() => setSavedOnly((v) => !v)}
        >{t("已收藏")}</button>
      </div>
      <div className="graph-panel">
        <div className="graph-caption">
          <span>{filtered.length} CONCEPTS</span>
          <span>{t("拖动画布 · 点选节点")}</span>
        </div>
        <svg
          ref={svg}
          viewBox="0 0 580 900"
          className="graph"
          role="group"
          aria-label={t("互动知识图谱")}
          onPointerDown={(e) => {
            if ((e.target as Element).closest("[data-node]")) return;
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const box = svg.current!.getBoundingClientRect(),
              scale = 580 / box.width;
            setPan({
              x: drag.current.px + (e.clientX - drag.current.x) * scale,
              y: drag.current.py + (e.clientY - drag.current.y) * scale,
            });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <defs>
            <pattern
              id="dots"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="var(--muted)" opacity=".25" />
            </pattern>
          </defs>
          <rect width="580" height="900" fill="url(#dots)" />
          <g
            transform={`translate(${pan.x + 290 * (1 - zoom)},${pan.y + 450 * (1 - zoom)}) scale(${zoom})`}
          >
            {allEdges.map((e, i) => {
              if (!visible.has(e.from) || !visible.has(e.to)) return null;
              const [x1, y1] = positions[e.from],
                [x2, y2] = positions[e.to];
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    near.has(e.from) && near.has(e.to)
                      ? "var(--accent)"
                      : "var(--muted)"
                  }
                  strokeWidth={e.personal ? 2 : 1.5}
                  opacity={near.has(e.from) && near.has(e.to) ? 0.55 : 0.16}
                  strokeDasharray={e.personal ? "6 5" : undefined}
                />
              );
            })}
            {filtered.map((c) => {
              const [x, y] = positions[c.id],
                isActive = c.id === focus.id;
              return (
                <g
                  key={c.id}
                  data-node={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name}，${c.zh}`}
                  onClick={() => choose(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      choose(c.id);
                    }
                  }}
                  transform={`translate(${x},${y})`}
                  className="graph-node"
                  opacity={near.has(c.id) ? 1 : 0.6}
                >
                  <circle
                    r={isActive ? 31 : 23}
                    fill="var(--panel)"
                    stroke={SUBJECTS[c.subject].color}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  {isActive && (
                    <circle
                      r="39"
                      fill="none"
                      stroke={SUBJECTS[c.subject].color}
                      opacity=".15"
                    />
                  )}
                  <text
                    y="7"
                    textAnchor="middle"
                    fill={SUBJECTS[c.subject].color}
                    fontSize="22"
                  >
                    {SUBJECTS[c.subject].symbol}
                  </text>
                  <text
                    y="54"
                    textAnchor="middle"
                    fontSize="14"
                    fill="var(--text)"
                  >
                    {c.name}
                  </text>
                  <text
                    y="73"
                    textAnchor="middle"
                    fontSize="13"
                    fill="var(--muted)"
                  >
                    {language === "zh" ? c.zh : ""}
                    {state.saved.includes(c.id) ? " · ★" : ""}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <div className="graph-tools">
          <button
            className="icon-button"
            aria-label={t("放大图谱")}
            disabled={zoom >= 2}
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          >
            <Plus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={t("缩小图谱")}
            disabled={zoom <= 0.6}
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
          >
            <Minus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={t("重置图谱视角")}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div className="concept-picker" aria-label={t("概念列表")}>
        {filtered.map((c) => (
          <button
            key={c.id}
            className={`chip ${c.id === focus.id ? "active" : ""}`}
            onClick={() => choose(c.id)}
          >
            {c.zh}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="hint">{t("没有匹配的概念。试试清除筛选或收藏一个知识点。")}</p>
        )}
      </div>
      <section
        className="concept-detail"
        style={
          { "--subject": SUBJECTS[focus.subject].color } as React.CSSProperties
        }
      >
        <div className="section-heading">
          <span className="eyebrow">{SUBJECTS[focus.subject].en}</span>
          <button
            className={`icon-button ${state.saved.includes(focus.id) ? "selected" : ""}`}
            aria-label={
              state.saved.includes(focus.id) ? t("取消收藏概念") : t("收藏概念")
            }
            onClick={() =>
              update((s) => ({
                ...s,
                saved: s.saved.includes(focus.id)
                  ? s.saved.filter((x) => x !== focus.id)
                  : [...s.saved, focus.id],
              }))
            }
          >
            <Bookmark
              size={19}
              fill={state.saved.includes(focus.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <h2>{focus.name}</h2>
        <p>{focus.description}</p>
        <label className="field-label">{t("我的理解")}<textarea
            value={state.notes[focus.id] ?? ""}
            maxLength={20000}
            onChange={(e) =>
              update((s) => ({
                ...s,
                notes: { ...s.notes, [focus.id]: e.target.value },
              }))
            }
            placeholder={t("用自己的话，把这个概念留下来…")}
          />
        </label>
        <div className="related-edges">
          {allEdges
            .filter((e) => e.from === focus.id || e.to === focus.id)
            .map((e, i) => {
              const other = e.from === focus.id ? e.to : e.from;
              return (
                <div className="edge-row" key={i}>
                  <button onClick={() => choose(other)}>
                    <span>
                      {e.personal ? t("个人关联") : t("概念关系")} · {e.label}
                    </span>
                    <strong>
                      {concepts.find((c) => c.id === other)?.name}{" "}
                      <ArrowUpRight size={15} />
                    </strong>
                  </button>
                  {e.personal && (
                    <button
                      className="text-button"
                      aria-label={t("删除与 {0} 的个人关联", other)}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          edges: s.edges.filter((x) => x !== e),
                        }))
                      }
                    >{t("删除")}</button>
                  )}
                </div>
              );
            })}
        </div>
        <button className="secondary" onClick={() => setLinking((v) => !v)}>
          <Link2 size={17} /> {linking ? t("收起关联编辑") : t("添加我的关联")}
        </button>
        {linking && (
          <form
            className="link-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!target || !label.trim()) return;
              update((s) => ({
                ...s,
                edges: [
                  ...s.edges,
                  {
                    from: focus.id,
                    to: target,
                    label: label.trim(),
                    personal: true,
                  },
                ],
              }));
              setLinking(false);
              setTarget("");
              setLabel("");
            }}
          >
            <label>{t("连接到")}<select
                value={target}
                required
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">{t("选择一个概念")}</option>
                {concepts
                  .filter((c) => c.id !== focus.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>{t("它们怎样关联？")}<input
                required
                maxLength={300}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("例如：它们用了同一种反证思路")}
              />
            </label>
            <button className="primary small" type="submit">{t("保存个人关联")}</button>
          </form>
        )}
        <h3>{t("沿着这个概念探索")}</h3>
        {articles
          .filter((a) => a.concepts.includes(focus.id))
          .map((a) => (
            <button
              className="related-article"
              key={a.id}
              onClick={() => open(a.id)}
            >
              <span>
                {a.title}
                <small>
                  {a.minutes} MIN · {t(SUBJECTS[a.subject].name)}
                </small>
              </span>
              <ArrowUpRight size={20} />
            </button>
          ))}
      </section>
    </>
  );
}
