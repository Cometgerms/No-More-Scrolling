import { useLanguage } from "./i18n";
import { MathText } from "./Math";

export const ALGEBRA_EXERCISES = {
  "clockwork-groups": {
    citation: "Gallian 8e · Ch. 3, Ex. 1 (Z₁₂ part) · p. 68 / PDF 88",
    zh: "求加法群 Z₁₂ 的阶与每个元素的阶。先算 8，再把同一方法用到其余元素；注意群的阶与元素的阶是两个概念。",
    en: "Find the order of the additive group Z₁₂ and of each element. Start with 8, then use the same method for the rest. Group order and element order are distinct concepts.",
    hintZh: "群的阶就是元素个数。对一个元素 a，问最少加多少次才回到 0。",
    hintEn: "Group order counts elements. For an element a, ask how many additions first return to 0.",
    formula: String.raw`\operatorname{ord}(a)=12/\gcd(12,a)`,
    solutionZh: "群的阶为 12。按 a=0,1,…,11 排列，元素阶依次为 1,12,6,4,3,12,2,12,3,4,6,12。特别地，0 的阶是 1，不是 0；8→4→0 给出 8 的阶为 3。每个元素的阶都整除 12，第三讲会解释原因。",
    solutionEn: "The group has order 12. For a=0,1,…,11, the orders are 1,12,6,4,3,12,2,12,3,4,6,12. The identity 0 has order 1, not 0. The path 8→4→0 gives order 3. Each order divides 12; lesson three explains why.",
  },
  "subgroup-test": {
    citation: "Gallian 8e · Ch. 3, Ex. 13 · p. 69 / PDF 89",
    zh: "H 是群 G 的非空子集，对群运算封闭，并满足：若 a 不在 H，则 a⁻¹ 也不在 H。H 一定是子群吗？先别被“不在”绕晕，试着从一个 x∈H 出发。",
    en: "H is a nonempty subset of G, closed under the group operation. If a is outside H, then a⁻¹ is also outside H. Must H be a subgroup? Begin with x in H and carefully unpack the negative statement.",
    hintZh: "反设 x⁻¹ 不在 H。把题目中的 a 换成 x⁻¹，会得到什么？",
    hintEn: "Suppose x⁻¹ is outside H. Substitute a=x⁻¹ into the given condition. What follows?",
    formula: String.raw`x^{-1}\notin H\ \Longrightarrow\ (x^{-1})^{-1}=x\notin H`,
    solutionZh: "这与 x∈H 矛盾，所以 H 中每个元素的逆元仍在 H。再取任意 x∈H，由乘法封闭得到 xx⁻¹=e∈H；结合律从 G 继承。因此 H 是子群。等价地，乘法封闭与逆元封闭一起给出 ab⁻¹∈H，可以使用本讲的判别法。",
    solutionEn: "This contradicts x in H, so H contains the inverse of each of its elements. Choose x in H; closure gives xx⁻¹=e in H. Associativity is inherited from G. Thus H is a subgroup. Equivalently, closure under products and inverses gives ab⁻¹ in H, allowing the subgroup test.",
  },
  "cosets-and-lagrange": {
    citation: "Gallian 8e · Ch. 7, Ex. 3 · p. 156 / PDF 176",
    zh: "在整数加法群 Z 中，H=3Z={…,−6,−3,0,3,6,…}。写出所有不同的左陪集。把整数看作无穷长的键盘：每隔三个键分到同一轨。",
    en: "In the additive integers Z, let H=3Z={…,−6,−3,0,3,6,…}. List all distinct left cosets. Imagine an infinite keyboard: every third key belongs to the same track.",
    hintZh: "先写 0+H、1+H、2+H、3+H。第四个是新的一轨，还是第一轨？",
    hintEn: "Write 0+H, 1+H, 2+H and 3+H. Is the fourth a new track, or the first one again?",
    formula: String.raw`H=3\mathbb Z,\quad 1+3\mathbb Z,\quad 2+3\mathbb Z`,
    solutionZh: "只有这三个不同陪集。任意整数除以 3 的余数是 0、1 或 2，同余的代表元产生相同陪集；不同余数的陪集不相交。这里 G 与 H 都无限，不能套用有限群的阶之比；我们是用余数直接数出三个陪集。",
    solutionEn: "These are the three distinct cosets. Every integer has remainder 0, 1 or 2 on division by 3. Equal remainders give the same coset, and different remainders give disjoint cosets. Both G and H are infinite, so do not use a ratio of finite group orders; count the residue classes directly.",
  },
};

export function AlgebraExercise({articleId}:{articleId:string}) {
  const {language}=useLanguage(), en=language==="en", exercise=ALGEBRA_EXERCISES[articleId as keyof typeof ALGEBRA_EXERCISES];
  if(!exercise) return null;
  return <section className="textbook-exercise"><span className="eyebrow">TEXTBOOK PRACTICE</span><h2>{en?"Your turn":"轮到你来推一遍"}</h2><p className="hint">{exercise.citation}</p><p>{en?exercise.en:exercise.zh}</p><p className="hint">{en?"Translated and scaffolded from the indicated exercise; the first lesson selects only the Z₁₂ part. Try before opening the solution.":"按所注教材题翻译并加入引导；第一讲只取原题 Z₁₂ 部分。先试着写几步，再展开讲解。"}</p><details><summary>{en?"Hint · one step at a time":"提示 · 先迈一步"}</summary><p>{en?exercise.hintEn:exercise.hintZh}</p></details><details><summary>{en?"Walk through the solution":"展开逐步讲解"}</summary><MathText value={exercise.formula}/><p>{en?exercise.solutionEn:exercise.solutionZh}</p></details></section>;
}
