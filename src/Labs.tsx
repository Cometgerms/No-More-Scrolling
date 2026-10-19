import { useLanguage } from "./i18n";
import { CyclicLab, SortingLab, SnowLab, CooperationLab } from "./NewLabs";
import { useEffect, useState } from "react";
import { Play, RotateCcw, ChevronRight, Pause } from "lucide-react";
import {
  cacheTrace,
  cantorIntervals,
  pairwise,
  condorcetWinner,
} from "./logic";
import { MathText } from "./Math";
import type { Article } from "./model";
function Measure() {
  const { t } = useLanguage();

  const [width, setWidth] = useState(35);
  return (
    <>
      <div className="lab-value">
        <span>{t("区间 [0, b]")}</span>
        <strong>b = {(width / 100).toFixed(2)}</strong>
      </div>
      <svg
        viewBox="0 0 360 170"
        className="lab-svg"
        role="img"
        aria-label={t("均匀分布密度为1，选中区间概率为{0}", width / 100)}
      >
        <defs>
          <pattern
            id="grid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0H0V30"
              fill="none"
              stroke="currentColor"
              opacity=".09"
            />
          </pattern>
        </defs>
        <rect x="25" y="20" width="310" height="110" fill="url(#grid)" />
        <path
          d="M25 20V130H335"
          fill="none"
          stroke="currentColor"
          opacity=".4"
        />
        <rect
          x="25"
          y="40"
          width={(310 * width) / 100}
          height="90"
          fill="var(--accent)"
          opacity=".24"
        />
        <path d="M25 40H335" stroke="var(--accent)" strokeWidth="2" />
        <path
          d={`M${25 + (310 * width) / 100} 35V136`}
          stroke="var(--accent)"
          strokeWidth="2"
        />
        <text x="20" y="156">
          0
        </text>
        <text x="330" y="156">
          1
        </text>
        <text x="30" y="30">
          density = 1
        </text>
        <circle cx="180" cy="130" r="4" fill="var(--text)" />
      </svg>
      <label className="slider-label">{t("拖动区间右端点")}<input
          aria-label={t("区间右端点")}
          type="range"
          min="0"
          max="100"
          value={width}
          onChange={(e) => setWidth(+e.target.value)}
        />
      </label>
      <MathText
        value={`\\mathbb P(0\\le X\\le ${width / 100})=${width / 100}`}
      />
      <p className="hint">{t("白点标记 x=0.5，它的概率始终为 0。着色面积表示区间概率。")}</p>
    </>
  );
}
function Cantor() {
  const { t } = useLanguage();

  const [level, setLevel] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setLevel((n) => {
          if (n >= 6) {
            setPlaying(false);
            return n;
          }
          return n + 1;
        }),
      900,
    );
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <>
      <div className="lab-value">
        <span>ITERATION {level}</span>
        <strong>{2 ** level} {t("个区间")}</strong>
      </div>
      <svg
        className="lab-svg"
        viewBox="0 0 360 190"
        role="img"
        aria-label={t("Cantor set 第{0}级近似", level)}
      >
        {Array.from({ length: level + 1 }, (_, i) => (
          <g key={i}>
            <text x="3" y={21 + i * 25}>
              {i}
            </text>
            {cantorIntervals(i).map(([a, b], j) => (
              <rect
                key={j}
                x={25 + a * 325}
                y={9 + i * 25}
                width={Math.max(0.4, (b - a) * 325)}
                height="14"
                rx="2"
                fill="var(--accent)"
                opacity={0.35 + (0.65 * (i + 1)) / (level + 1)}
              />
            ))}
          </g>
        ))}
      </svg>
      <MathText
        value={`\\lambda(C_{${level}})=\\left(\\frac23\\right)^{${level}}\\approx ${((2 / 3) ** level).toFixed(4)}`}
      />
      <div className="button-row">
        <button
          className="primary small"
          disabled={level === 6}
          onClick={() => setLevel((n) => n + 1)}
        >{t("删去中间部分")}<ChevronRight size={16} />
        </button>
        <button
          className="icon-button"
          aria-label={playing ? t("暂停动画") : t("播放动画")}
          disabled={level === 6 && !playing}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          className="icon-button"
          aria-label={t("重置 Cantor 实验")}
          onClick={() => {
            setLevel(0);
            setPlaying(false);
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <p className="hint">{t("动画止于第 6 步。每个有限步骤都有正长度，极限才是 0。")}</p>
    </>
  );
}
function Halting() {
  const { t } = useLanguage();

  const [prediction, setPrediction] = useState<number | null>(null),
    [step, setStep] = useState(0);
  return (
    <>
      <div className="segmented">
        <button
          className={prediction === 1 ? "active" : ""}
          onClick={() => {
            setPrediction(1);
            setStep(0);
          }}
        >{t("H 预测：会停")}</button>
        <button
          className={prediction === 0 ? "active" : ""}
          onClick={() => {
            setPrediction(0);
            setStep(0);
          }}
        >{t("H 预测：不停")}</button>
      </div>
      <div className="trace">
        <div className="trace-line">
          <span>01</span>{t("输入 D 的编码给 D")}</div>
        <div className={`trace-line ${step < 1 ? "muted" : ""}`}>
          <span>02</span>
          {step >= 1 ? `H(D,D) = ${prediction}` : t("等待预测器回答")}
        </div>
        <div className={`trace-line ${step < 2 ? "muted" : ""}`}>
          <span>03</span>
          {step >= 2
            ? prediction === 1
              ? t("D 进入无限循环")
              : t("D 立即 return")
            : t("执行 D 的对应分支")}
        </div>
        <div className={`trace-line ${step < 3 ? "muted" : ""}`}>
          <span>04</span>
          {step >= 3 ? t("预测与实际行为矛盾") : t("比较预测与实际行为")}
        </div>
      </div>
      <button
        className="primary small"
        disabled={prediction === null || step === 3}
        onClick={() => setStep((n) => n + 1)}
      >{t("执行下一步")}<ChevronRight size={16} />
      </button>
      {step === 3 && (
        <p className="result">{t("试试另一个预测。你会发现两种答案都无法自洽。")}</p>
      )}
    </>
  );
}
function Cache() {
  const { t } = useLanguage();

  const [conflict, setConflict] = useState(true),
    [step, setStep] = useState(0);
  const b = conflict ? 64 : 16,
    trace = cacheTrace([0, b, 0, b, 0, b]),
    current = trace[step - 1],
    cache = current?.cache ?? [null, null, null, null];
  return (
    <>
      <div className="segmented">
        <button
          className={conflict ? "active" : ""}
          onClick={() => {
            setConflict(true);
            setStep(0);
          }}
        >
          B = 0x40
        </button>
        <button
          className={!conflict ? "active" : ""}
          onClick={() => {
            setConflict(false);
            setStep(0);
          }}
        >
          B = 0x10
        </button>
      </div>
      <div className="cache-lines">
        {cache.map((tag, i) => (
          <div key={i} className={current?.set === i ? "touched" : ""}>
            <span>SET {i}</span>
            <strong>{tag === null ? "empty" : `tag ${tag}`}</strong>
          </div>
        ))}
      </div>
      <div className="access-sequence">
        {trace.map((r, i) => (
          <span key={i} className={i < step ? (r.hit ? "hit" : "miss") : ""}>
            {i % 2 ? "B" : "A"}
            <small>{i < step ? (r.hit ? "HIT" : "MISS") : "·"}</small>
          </span>
        ))}
      </div>
      <p className="hint" aria-live="polite">
        {current
          ? t("访问 0x{0} → set {1}，tag {2}。{3}", current.address.toString(16).padStart(2, "0"), current.set, current.tag, current.hit ? t("命中。") : t("未命中，装入并替换该行。"))
          : t("从空 cache 开始，一次读取一个地址。")}
      </p>
      <div className="button-row">
        <button
          className="primary small"
          disabled={step === 6}
          onClick={() => setStep((n) => n + 1)}
        >{t("下一次访问")}<ChevronRight size={16} />
        </button>
        <button
          className="icon-button"
          aria-label={t("重置缓存")}
          onClick={() => setStep(0)}
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </>
  );
}
const events = [
  {
    date: 1689,
    title: "Bill of Rights",
    detail: "议会对征税等事项的同意受到法律确认。",
  },
  {
    date: 1694,
    title: "Bank of England 成立",
    detail: "早期认购记录合计 £1.2 million；融资与战争需求相关。",
  },
  {
    date: 1946,
    title: "Bank of England 国有化",
    detail: "成立时的组织形式与今天不同，不能把现代属性投射回 1694 年。",
  },
];
function Timeline() {
  const { t } = useLanguage();

  const [order, setOrder] = useState<number[]>([]),
    [checked, setChecked] = useState(false);
  const correct = order.join(",") === "0,1,2";
  return (
    <>
      <p>{t("按你认为的时间顺序点击事件：")}</p>
      <div className="timeline-options">
        {[2, 0, 1].map((i) => (
          <button
            key={i}
            disabled={order.includes(i)}
            onClick={() => setOrder((o) => [...o, i])}
          >
            <span>{order.includes(i) ? order.indexOf(i) + 1 : "+"}</span>
            {t(events[i].title)}
          </button>
        ))}
      </div>
      {checked && (
        <>
          <p className="result">
            {correct
              ? t("顺序正确。")
              : t("这里是实际顺序；时间先后本身不证明因果。")}
          </p>
          <div className="timeline">
            {events.map((e) => (
              <div key={e.date}>
                <b>{e.date}</b>
                <h4>{t(e.title)}</h4>
                <p>{t(e.detail)}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="button-row">
        <button
          className="primary small"
          disabled={order.length !== 3 || checked}
          onClick={() => setChecked(true)}
        >{t("揭示时间线")}</button>
        <button
          className="icon-button"
          aria-label={t("重新排列时间线")}
          onClick={() => {
            setOrder([]);
            setChecked(false);
          }}
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <p className="hint">{t("来源：Bank of England 的 History 与 Founding documents。")}</p>
    </>
  );
}
const evidence = [
  {
    text: "档案记载：某银行在 1694 年成立。",
    answer: 0,
    why: "这是可以通过档案核实的事件陈述。",
  },
  {
    text: "财政约束可能通过降低违约担忧改善融资。",
    answer: 1,
    why: "这是对作用机制的解释，需要额外证据支持。",
  },
  {
    text: "假如改革没有发生，在其余条件近似不变时，融资可能更困难。",
    answer: 2,
    why: "这是未发生世界的推断，需要明确假设。",
  },
];
function Evidence() {
  const { t } = useLanguage();

  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState<number | null>(null);
  const item = evidence[index];
  return (
    <>
      <span className="eyebrow">EVIDENCE FILE {index + 1} / 3</span>
      <blockquote>{t(item.text)}</blockquote>
      <div className="choices">
        {[t("事实陈述"), t("机制解释"), t("反事实推断")].map((x, i) => (
          <button
            className={
              answer === i ? (i === item.answer ? "correct" : "incorrect") : ""
            }
            key={x}
            onClick={() => setAnswer(i)}
          >
            {x}
          </button>
        ))}
      </div>
      {answer !== null && (
        <p className="result">
          {answer === item.answer
            ? t("判断正确。")
            : t("再想想证据能直接观察到什么。")}
          {t(item.why)}
        </p>
      )}
      <button
        className="text-button"
        onClick={() => {
          setIndex((i) => (i + 1) % 3);
          setAnswer(null);
        }}
      >
        {index === 2 ? t("从头再看") : t("下一份材料")} <ChevronRight size={16} />
      </button>
    </>
  );
}
function Voting() {
  const { t } = useLanguage();

  const [counts, setCounts] = useState([1, 1, 1]);
  const results = pairwise(counts),
    winner = condorcetWinner(counts),
    cycle =
      results.every((r) => r.winner === r.a) ||
      results.every((r) => r.winner === r.b);
  return (
    <>
      <div className="voters">
        {["A ≻ B ≻ C", "B ≻ C ≻ A", "C ≻ A ≻ B"].map((p, i) => (
          <label key={p}>
            <span>
              {p}
              <b>{counts[i]} {t("人")}</b>
            </span>
            <input
              type="range"
              min="1"
              max="9"
              value={counts[i]}
              aria-label={t("{0} 的人数", p)}
              onChange={(e) =>
                setCounts((v) =>
                  v.map((n, j) => (j === i ? +e.target.value : n)),
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="pairwise">
        {results.map((r) => (
          <div key={r.a}>
            <span>
              {r.a} vs {r.b}
            </span>
            <strong>
              {r.av} : {r.bv}
            </strong>
            <b>{r.winner === "tie" ? t("平票") : t("{0} 胜", r.winner)}</b>
          </div>
        ))}
      </div>
      <p className="result" aria-live="polite">
        {winner
          ? t("Condorcet winner：{0}，逐对击败其他候选。", winner)
          : cycle
            ? t("出现多数循环！没有 Condorcet winner。")
            : t("存在平票，没有严格 Condorcet winner。")}
      </p>
    </>
  );
}
function Agenda() {
  const { t } = useLanguage();

  const [pair, setPair] = useState("AB");
  const outcomes: Record<string, { first: string; last: string }> = {
    AB: { first: "A", last: "C" },
    BC: { first: "B", last: "A" },
    CA: { first: "C", last: "B" },
  };
  const o = outcomes[pair];
  return (
    <>
      <p className="hint">{t("固定多数关系：A → B → C → A")}</p>
      <div className="segmented">
        {["AB", "BC", "CA"].map((p) => (
          <button
            className={pair === p ? "active" : ""}
            onClick={() => setPair(p)}
            key={p}
          >
            {p[0]} vs {p[1]}
          </button>
        ))}
      </div>
      <div className="agenda-stage">
        <span>ROUND 01</span>
        <p>
          {pair[0]} vs {pair[1]}
        </p>
        <strong>{o.first} {t("胜出")}</strong>
      </div>
      <div className="agenda-stage final">
        <span>FINAL ROUND</span>
        <p>
          {o.first} vs {o.last}
        </p>
        <strong>{o.last} {t("最终胜出")}</strong>
      </div>
      <p className="hint">{t("改变的只有先后顺序。模型假设每轮 sincere voting。")}</p>
    </>
  );
}
export function Lab({ article }: { article: Article }) {
  const { t } = useLanguage();

  const component = {
    measure: <Measure />,
    cantor: <Cantor />,
    halting: <Halting />,
    cache: <Cache />,
    timeline: <Timeline />,
    evidence: <Evidence />,
    voting: <Voting />,
    agenda: <Agenda />,
    cyclic: <CyclicLab />,
    sorting: <SortingLab />,
    snow: <SnowLab />,
    cooperation: <CooperationLab />,
  }[article.lab];
  return (
    <section className="lab">
      <div className="lab-header">
        <span className="live-dot" />
        <span className="eyebrow">{t("THOUGHT LAB · 动手想一想")}</span>
      </div>
      <p className="lab-intro">{article.labIntro}</p>
      {component}
    </section>
  );
}
