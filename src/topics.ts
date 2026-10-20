import type { State, Subject } from "./model";

export const TOPICS: { id: string; subject: Subject; zh: string; en: string; description: string; descriptionEn: string; lessons: string[] }[] = [
  { id: "abstract-algebra", subject: "math", zh: "抽象代数 · AA", en: "Abstract Algebra · AA", description: "入门三讲：从生成元，到子群，再到陪集与 Lagrange theorem。", descriptionEn: "Three introductory lessons: generators, subgroups, cosets and Lagrange’s theorem.", lessons: ["clockwork-groups", "subgroup-test", "cosets-and-lagrange"] },
  { id: "theoretical-cs", subject: "cs", zh: "计算机 · 理论与算法", en: "CS · Theory & algorithms", description: "计算的边界、系统模型与排序的信息下界。", descriptionEn: "Limits of computation, system models and the information bound on sorting.", lessons: ["machine-against-itself", "tiny-cache-big-miss", "sorting-information-limit"] },
  { id: "history-evidence", subject: "history", zh: "历史 · 人物与证据", en: "History · People & evidence", description: "从金融革命到 John Snow，练习区分事件、解释与因果。", descriptionEn: "From the Financial Revolution to John Snow: events, interpretations and causation.", lessons: ["borrowing-power", "history-counterfactual", "snow-beyond-the-map"] },
  { id: "political-games", subject: "politics", zh: "政治 · 制度与国家博弈", en: "Politics · Institutions & interstate games", description: "投票、议程权与国家间长期合作，先看模型，再看边界。", descriptionEn: "Voting, agenda power and long-term interstate cooperation: models and their limits.", lessons: ["majority-without-winner", "who-sets-the-agenda", "states-and-the-future"] },
];
export function topicProgress(topic: typeof TOPICS[number], state: State) {
  const completed = topic.lessons.filter(id => state.progress[id]?.complete).length;
  return { completed, total: topic.lessons.length, next: topic.lessons.find(id => !state.progress[id]?.complete) };
}
export function topicForArticle(topicId: string | null, articleId: string) {
  return TOPICS.find(t => t.id === topicId && t.lessons.includes(articleId));
}
