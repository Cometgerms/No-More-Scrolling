import { useState } from "react";
import { useLanguage } from "./i18n";
import { MathText } from "./Math";
import { additiveOrbit, cooperationValues, sortingBound, subgroupWitness, cyclicCosets } from "./learning-models";

export function SubgroupLab() {
  const { language }=useLanguage(), en=language==="en";
  const [chosen,setChosen]=useState([0,2,4,6]), witness=subgroupWitness(chosen);
  return <><div className="residue-picker">{Array.from({length:8},(_,i)=><button key={i} className="chip" aria-pressed={chosen.includes(i)} onClick={()=>setChosen(chosen.includes(i)?chosen.filter(x=>x!==i):[...chosen,i].sort((a,b)=>a-b))}>{i}</button>)}</div>
    <MathText value={`H=\\{${chosen.join(",")}\\}`}/>
    <div role="status">{!chosen.length ? (en?"The empty set is not a subgroup: no identity.":"空集不是子群：它没有单位元。") : witness ? <><MathText value={String.raw`${witness.a}-${witness.b}\equiv${witness.result}\pmod8,\quad ${witness.result}\notin H`}/><p>{en?"One counterexample is enough to reject the subset.":"一个反例就足以否定这个子集。"}</p></> : <p>It’s MyGROUP!!!!! <span>{en?"Nonempty and closed under subtraction: subgroup confirmed.":"非空且对减法封闭：子群判别通过。"}</span></p>}</div>
  </>;
}
export function CosetLab() {
  const {language}=useLanguage(), en=language==="en", [k,setK]=useState(4), {subgroup,cosets}=cyclicCosets(12,k);
  return <><label className="lab-control">k = {k}<input type="range" min="0" max="11" value={k} aria-label={en?"Subgroup generator":"子群生成元"} onChange={e=>setK(+e.target.value)}/></label>
    <div className="coset-rows">{cosets.map((row,i)=><div key={i}><strong>{row[0]} + H</strong><span>{row.map(x=><span key={x} className="coset-residue">{x}</span>)}</span></div>)}</div>
    <MathText value={String.raw`12=${cosets.length}\times${subgroup.length},\quad [G:H]=${cosets.length}`}/><p className="hint">{en?"Each residue appears once. Equal size is shown by numbers, not color alone.":"每个余数恰好出现一次；每行相同数量的元素对应一个陪集。"}</p></>;
}

export function CyclicLab() {
  const { language } = useLanguage(), en = language === "en";
  const [n, setN] = useState(12), [k, setK] = useState(5);
  const orbit = additiveOrbit(n, k), reached = new Set(orbit);
  const point = (i: number) => ({ x: 160 + 112 * Math.sin(i * 2 * Math.PI / n), y: 150 - 112 * Math.cos(i * 2 * Math.PI / n) });
  return <>
    <label className="lab-control">{en ? "Clock size" : "钟面大小"} n = {n}<input aria-label={en ? "Clock size" : "钟面大小"} type="range" min="2" max="16" value={n} onChange={e => { const next = +e.target.value; setN(next); setK(Math.min(k, next - 1)); }} /></label>
    <label className="lab-control">{en ? "Step" : "步长"} k = {k}<input aria-label={en ? "Step" : "步长"} type="range" min="0" max={n - 1} value={k} onChange={e => setK(+e.target.value)} /></label>
    <svg className="learning-clock" viewBox="0 0 320 300" role="img" aria-label={en ? `Reachable residues: ${orbit.join(", ")}` : `可达余数：${orbit.join("、")}`}>
      <circle cx="160" cy="150" r="112" fill="none" stroke="var(--line)" />
      {orbit.map((v, i) => { const a = point(v), z = point(orbit[(i + 1) % orbit.length]); return <line key={v} x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke="var(--accent)" opacity=".45" />; })}
      {Array.from({ length: n }, (_, i) => { const p = point(i); return <g key={i}><circle cx={p.x} cy={p.y} r="15" fill={reached.has(i) ? "var(--accent)" : "var(--panel)"} stroke="var(--line)" /><text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fill={reached.has(i) ? "var(--accent-ink)" : "var(--text)"}>{i}</text></g>; })}
    </svg>
    <p className="orbit-path">{[...orbit, 0].join(" → ")}</p>
    <MathText value={String.raw`\operatorname{ord}(${k})=${orbit.length},\qquad|\mathbb Z_{${n}}|=${n}`} />
    <p className="hint">{orbit.length === n ? (en ? "This step generates the whole group." : "这个步长能生成整个群。") : (en ? "This step generates a proper subgroup." : "这个步长只能生成一个真子群。")}</p>
  </>;
}
export function SortingLab() {
  const { language } = useLanguage(), en = language === "en";
  const [n, setN] = useState(4), [h, setH] = useState(4);
  const { permutations, comparisons } = sortingBound(n), capacity = 2 ** h, max = Math.max(permutations, capacity);
  return <>
    <label className="lab-control">n = {n}<input aria-label={en ? "Number of elements" : "元素个数"} type="range" min="2" max="10" value={n} onChange={e => setN(+e.target.value)} /></label>
    <label className="lab-control">{en ? "Comparison budget" : "比较预算"} h = {h}<input aria-label={en ? "Comparison budget" : "比较预算"} type="range" min="0" max="24" value={h} onChange={e => setH(+e.target.value)} /></label>
    <div className="learning-bars">{[["n!", permutations], ["2ʰ", capacity]].map(([label, value]) => <div key={label}><span>{label} = {Number(value).toLocaleString(language === "en" ? "en-US" : "zh-CN")}</span><meter min="0" max={max} value={Number(value)} aria-label={String(label)} /></div>)}</div>
    <MathText value={String.raw`h\ge\lceil\log_2(${n}!)\rceil=${comparisons}`} />
    <p role="status">{h < comparisons ? (en ? "Insufficient leaves: some input must exceed this budget." : "叶子不够：必有输入需要超过这个比较预算。") : (en ? "Enough capacity. This does not prove a sorting tree of this height exists." : "信息容量足够，但不能据此断言存在这个高度的排序树。")}</p>
  </>;
}
export function SnowLab() {
  const { language } = useLanguage(), en = language === "en";
  const [unequal, setUnequal] = useState(true);
  const groups = [{ name: "A", cases: 30, population: unequal ? 3000 : 1000 }, { name: "B", cases: 20, population: 1000 }];
  return <>
    <div className="segmented"><button className={unequal ? "active" : ""} onClick={() => setUnequal(true)}>{en ? "Unequal populations" : "人口不同"}</button><button className={!unequal ? "active" : ""} onClick={() => setUnequal(false)}>{en ? "Equal populations" : "人口相同"}</button></div>
    <div className="learning-bars">{groups.map(g => <div key={g.name}><strong>{g.name}: {g.cases} / {g.population}</strong><span>{en ? "Per 1,000 people" : "每千人发生数"}: {g.cases / g.population * 1000}</span><meter min="0" max="30" value={g.cases / g.population * 1000} aria-label={`${g.name} ${en ? "rate" : "发生率"}`} /></div>)}</div>
    <p>{en ? "A always has more cases. Its rate is lower only in the unequal-population scenario. A rate comparison still does not remove confounding." : "A 的病例总数一直更多；但只有在人口不同的这个场景里，A 的发生率更低。比较发生率仍然不能自动排除混杂因素。"}</p>
    <p className="hint">{en ? "Illustrative counts only; not historical observations or medical advice." : "仅为虚构教学数据，不是历史观测或医疗建议。"}</p>
  </>;
}
export function CooperationLab() {
  const { language } = useLanguage(), en = language === "en";
  const [delta, setDelta] = useState(.5), values = cooperationValues(delta);
  return <>
    <label className="lab-control">δ = {delta.toFixed(2)}<input aria-label={en ? "Discount factor" : "折扣因子"} type="range" min="0" max="0.95" step="0.05" value={delta} onChange={e => setDelta(+e.target.value)} /></label>
    <div className="learning-bars">{[[en ? "Cooperate" : "保持合作", values.cooperate], [en ? "Defect once" : "背叛一次", values.defect]].map(([label, value]) => <div key={label}><span>{label}: {Number(value).toFixed(2)}</span><meter min="0" max={Math.max(values.cooperate, values.defect)} value={Number(value)} aria-label={String(label)} /></div>)}</div>
    <p role="status">{delta >= .5 ? (en ? "Cooperation is at least as good under these assumptions; it is not guaranteed." : "在这些假设下，合作至少同样有利；不意味着合作必然发生。") : (en ? "Defecting now pays more under these assumptions." : "在这些假设下，当期背叛更有利。")}</p>
    <p className="hint">{en ? "Infinite horizon · perfect monitoring · credible punishment · illustrative utilities" : "无限重复 · 完美监测 · 可信惩罚 · 示例效用"}</p>
  </>;
}
