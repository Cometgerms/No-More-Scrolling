import { useLanguage } from "./i18n";
import { useState } from "react";
import { cantorIntervals } from "./logic";

/** @requires A curated figure identifier. @ensures Diagrams remain finite, labeled models. */
export function ConceptFigure({ kind }: { kind: string }) {
  const { t } = useLanguage();

  const [step, setStep] = useState(2);
  const [point, setPoint] = useState(false);
  if (kind === "measure") return (
    <figure className="concept-figure">
      <figcaption><span className="eyebrow">VISUAL INTUITION · 01</span><strong>{t("一个点，没有面积。")}</strong></figcaption>
      <div className="segmented" aria-label={t("选择概率事件")}>
        <button aria-pressed={!point} className={!point ? "active" : ""} onClick={() => setPoint(false)}>{t("Interval · 区间")}</button>
        <button aria-pressed={point} className={point ? "active" : ""} onClick={() => setPoint(true)}>{t("Singleton · 单点")}</button>
      </div>
      <svg viewBox="0 0 360 160" role="img" aria-label={point ? t("单点事件面积为零") : t("区间从0.3到0.7，密度曲线下面积为0.4")}>
        <path d="M30 20V125H335" className="figure-axis" />
        <path d="M30 40H330" className="figure-line" />
        <rect className="figure-area" x={point ? 180 : 120} y="40" width={point ? 0 : 120} height="85" />
        <path d="M180 35V125" className="figure-line" strokeDasharray="4 5" opacity=".6" />
        <circle cx="180" cy="125" r="5" fill="var(--accent)" />
        <text x="30" y="148">0</text><text x="165" y="148">0.5</text><text x="325" y="148">1</text>
        <text x="35" y="28">f(x) = 1</text>
      </svg>
      <p className="figure-result" role="status">{point ? "P(X = 0.5) = 0" : "P(0.3 ≤ X ≤ 0.7) = 0.4"}</p>
      <p className="hint">{t("切换看看：概率对应 density 下的面积。亮点只是位置标记，画出来的大小不代表概率。")}</p>
    </figure>
  );
  if (kind === "cantor") return (
    <figure className="concept-figure">
      <figcaption><span className="eyebrow">FINITE APPROXIMATION · 02</span><strong>{t("长度退场，分支留下。")}</strong></figcaption>
      <svg viewBox="0 0 360 180" role="img" aria-label={t("Cantor set 第{0}步：{1}个区间，总长为(2/3)的{2}次方", step, 2 ** step, step)}>
        {Array.from({ length: 6 }, (_, i) => <g key={i} opacity={i <= step ? 1 : .12}>
          <text x="4" y={25 + i * 28}>{i}</text>
          {cantorIntervals(i).map(([a, b], j) => <rect key={j} x={30 + a * 300} y={14 + i * 28} width={(b - a) * 300} height="13" rx="2" fill="var(--accent)" />)}
        </g>)}
      </svg>
      <label className="slider-label">Construction step · n = {step}<input type="range" min="0" max="5" value={step} onChange={e => setStep(+e.target.value)} aria-label={t("Cantor 示意图步骤")} /></label>
      <p className="figure-result" role="status">{2 ** step} intervals · length = {((2 / 3) ** step).toFixed(4)}</p>
      <p className="hint">{t("拖动查看有限步骤。即使第 5 步看起来像灰尘，剩余长度仍大于零。")}</p>
    </figure>
  );
  if (kind === "diagonal") {
    const rows = ["01010", "11001", "10110", "00101", "11100"];
    const flipped = rows.map((r, i) => r[i] === "0" ? "1" : "0");
    return (
      <figure className="concept-figure">
        <figcaption><span className="eyebrow">DIAGONALIZATION · 03</span><strong>{t("沿着对角线，逃出列表。")}</strong></figcaption>
        <div className="diagonal-grid" aria-label={t("五个二进制序列的前五位，对角线高亮")}>
          {rows.map((row, i) => <div key={i}><small>b{i + 1}</small>{[...row].map((bit, j) => <span key={j} className={i === j ? "diagonal-bit" : ""}>{bit}</span>)}<small>…</small></div>)}
          <div className="diagonal-answer"><small>d</small>{flipped.map((bit, i) => <span key={i}>{point ? bit : "?"}</span>)}<small>…</small></div>
        </div>
        <button className="secondary small" aria-pressed={point} onClick={() => setPoint(v => !v)}>{point ? t("收起构造") : t("翻转对角线 · construct d")}</button>
        <p className="hint">{point ? t("d 的第 n 位与第 n 行不同。图中只画前五位；证明要求对每个自然数 n 都这样构造。") : t("假设序列已经全部列出。把第 n 行的第 n 位翻转，会得到什么？")}</p>
      </figure>
    );
  }
  return null;
}
