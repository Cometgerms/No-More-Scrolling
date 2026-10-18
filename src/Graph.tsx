import { useLanguage, useContent } from "./i18n";
import { SubjectIcon } from "./ProfileArt";
import { EdgeEditor } from "./EdgeEditor";
import { edgeKey, gestureView, zoomAt, type Point, type View } from "./graph-gesture";
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
import { SUBJECTS, type Edge, type State, type Subject } from "./model";
const positions: Record<string, [number, number]> = {
  measure: [100, 70], countable: [300, 70], voting: [485, 70],
  cantor: [100, 235], diagonal: [300, 235], relation: [485, 235],
  cache: [100, 400], halting: [300, 400],
  modular: [100, 565], decidability: [300, 565], agenda: [485, 565],
  bank: [100, 730], credit: [300, 730], causal: [485, 730],
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
  const content = useContent();
  const articles = content.articles.filter(a => state.progress[a.id]?.complete);
  const learned = new Set(articles.flatMap(a => a.concepts));
  const concepts = content.concepts.filter(c => learned.has(c.id));
  const edges = content.edges.filter(e => learned.has(e.from) && learned.has(e.to));

  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<Subject | "all">("all"),
    [savedOnly, setSavedOnly] = useState(false),
    [view, setView] = useState<View>({ zoom: 1, pan: { x: 0, y: 0 } }),
    [linking, setLinking] = useState(false),
    [target, setTarget] = useState(""),
    [label, setLabel] = useState("");
  const { zoom, pan } = view;
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const detail = useRef<HTMLElement>(null), edgeDetail = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>()), moved = useRef(false);
  const origin = useRef<{ view: View; points: Point[] }>({ view, points: [] });
  const currentView = useRef(view); currentView.current = view;
  function point(e: React.PointerEvent<SVGSVGElement>) {
    const matrix = e.currentTarget.getScreenCTM();
    return matrix ? new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()) : { x:e.clientX,y:e.clientY };
  }
  function release(e: React.PointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    origin.current = { view: currentView.current, points: [...pointers.current.values()] };
  }
  function selectEdge(edge: Edge) {
    if (moved.current) return;
    setSelectedEdge(edge);
    requestAnimationFrame(() => edgeDetail.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  const svg = useRef<SVGSVGElement>(null);
  const position = (id: string): [number, number] => positions[id] ?? [100 + (concepts.findIndex(c => c.id === id) % 3) * 190, 150 + Math.floor(concepts.findIndex(c => c.id === id) / 3) * 150];
  const allEdges = [...edges, ...state.edges.filter(e => learned.has(e.from) && learned.has(e.to))],
    focus = concepts.find((c) => c.id === selected) ?? concepts[0];
  const near = new Set([
    focus?.id,
    ...allEdges
      .filter((e) => e.from === focus?.id || e.to === focus?.id)
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
    setSelectedEdge(null);
    requestAnimationFrame(() => { detail.current?.scrollIntoView({ behavior: "smooth", block: "start" }); detail.current?.focus({ preventScroll: true }); });
    setLinking(false);
    setTarget("");
    setLabel("");
  }
  if (!focus) return <section className="empty learned-empty"><h1>{language === "en" ? "Your graph starts with a finished read" : "读完一篇，点亮你的图谱"}</h1><p>{language === "en" ? "Only concepts from completed articles appear here. Your notes and connections are kept." : "这里只显示已读完文章里的概念。已有笔记和关联仍会保留。"}</p><a className="primary" href="#/today">{language === "en" ? "Read today’s selection →" : "去读今日精选 →"}</a></section>;
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR CONNECTED MIND</span>
        <h1>{language === "en" ? "Knowledge graph" : "知识图谱"}</h1>
        <p>{language === "en" ? "Concepts from your completed reads. Open a node or trace a connection." : "只展示已读完文章的概念，点击节点或连线继续探索。"}</p>
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
          <span>{language === "en" ? "Drag · pinch · tap" : "拖动 · 双指缩放 · 点击探索"}</span>
        </div>
        <svg
          ref={svg}
          viewBox="0 0 580 900"
          className="graph"
          role="group"
          aria-label={t("互动知识图谱")}
          onPointerDown={e => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if (!pointers.current.size) moved.current = false;
            pointers.current.set(e.pointerId, point(e));
            if (pointers.current.size > 1) moved.current = true;
            origin.current = { view: currentView.current, points: [...pointers.current.values()] };
            (e.target as Element).setPointerCapture(e.pointerId);
          }}
          onPointerMove={e => {
            if (!pointers.current.has(e.pointerId)) return;
            pointers.current.set(e.pointerId, point(e));
            const points = [...pointers.current.values()], start = origin.current.points;
            if (points.some((p,i) => Math.hypot(p.x-start[i].x,p.y-start[i].y)>6)) moved.current = true;
            const next = gestureView(origin.current.view,start,points);
            currentView.current = next; setView(next);
          }}
          onPointerUp={release}
          onPointerCancel={e => { moved.current = true; release(e); }}
          onLostPointerCapture={release}
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
            transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}
          >
            {allEdges.map((e, i) => {
              if (!visible.has(e.from) || !visible.has(e.to)) return null;
              const [x1, y1] = position(e.from),
                [x2, y2] = position(e.to);
              const active = e.from === focus?.id || e.to === focus?.id;
              const path = `M${x1},${y1} Q${(x1+x2)/2+25},${(y1+y2)/2-18} ${x2},${y2}`;
              return <g key={i} className="graph-edge" role="button" tabIndex={0} aria-label={`${concepts.find(c => c.id === e.from)?.name} ↔ ${concepts.find(c => c.id === e.to)?.name}: ${state.edgeReasons?.[edgeKey(e.from,e.to)] ?? e.label}`} onClick={() => selectEdge(e)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); moved.current = false; selectEdge(e); } }}>
                <path d={path} fill="none" stroke={active ? "var(--accent)" : "var(--muted)"} strokeWidth={active ? 2.5 : 1.5} opacity={active ? .65 : .25} strokeDasharray={e.personal ? "6 5" : undefined} />
                <path d={path} fill="none" stroke="transparent" strokeWidth="22" />
              </g>;
            })}
            {filtered.map((c) => {
              const [x, y] = position(c.id),
                isActive = c.id === focus.id;
              return (
                <g
                  key={c.id}
                  data-node={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name}，${c.zh}`}
                  onClick={() => { if (!moved.current) choose(c.id); }}
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
                  <rect x="-88" y="-40" width="176" height="120" rx="18" fill="transparent" />
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
                  <g style={{ color: SUBJECTS[c.subject].color }}><SubjectIcon subject={c.subject} x={-12} y={-12} size={24} /></g>
                  <text
                    y="54"
                    textAnchor="middle"
                    fontSize="16"
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
        <div className="graph-tools"><span className="zoom-label">{Math.round(zoom*100)}%</span>
          <button
            className="icon-button"
            aria-label={t("放大图谱")}
            disabled={zoom >= 3}
            onClick={() => setView(v => zoomAt(v, v.zoom + .25, {x:290,y:450}))}
          >
            <Plus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={t("缩小图谱")}
            disabled={zoom <= 0.6}
            onClick={() => setView(v => zoomAt(v, v.zoom - .25, {x:290,y:450}))}
          >
            <Minus size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={t("重置图谱视角")}
            onClick={() => {
              setView({ zoom:1, pan:{x:0,y:0} });
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div ref={edgeDetail} className="edge-detail-anchor">{selectedEdge && <EdgeEditor key={edgeKey(selectedEdge.from,selectedEdge.to)} edge={selectedEdge} state={state} update={update} close={() => setSelectedEdge(null)} />}</div>
      <div className="concept-picker" aria-label={t("概念列表")}>
        {filtered.map((c) => (
          <button
            key={c.id}
            className={`chip ${c.id === focus.id ? "active" : ""}`}
            onClick={() => choose(c.id)}
          >
            {language === "en" ? c.name : c.zh}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="hint">{t("没有匹配的概念。试试清除筛选或收藏一个知识点。")}</p>
        )}
      </div>
      <section
        ref={detail} tabIndex={-1} className="concept-detail"
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
        <div className="section-heading"><h2>{focus.name}</h2><button className="text-button" onClick={() => svg.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>{language === "en" ? "Back to graph ↑" : "返回图谱 ↑"}</button></div>
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
            .filter((e) => e.from === focus?.id || e.to === focus?.id)
            .map((e, i) => {
              const other = e.from === focus.id ? e.to : e.from;
              return (
                <div className="edge-row" key={i}>
                  <button onClick={() => choose(other)}>
                    <span>
                      {e.personal ? t("个人关联") : t("概念关系")} · {state.edgeReasons?.[edgeKey(e.from,e.to)] ?? e.label}
                    </span>
                    <strong>
                      {concepts.find((c) => c.id === other)?.name}{" "}
                      <ArrowUpRight size={15} />
                    </strong>
                  </button>
                  <button className="text-button" onClick={() => { moved.current = false; selectEdge(e); }}>{language === "en" ? "Edit explanation" : "编辑说明"}</button>
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
