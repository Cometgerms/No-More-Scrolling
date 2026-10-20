import { writeFileSync } from "node:fs";
import { articles, concepts, edges } from "../src/content";
import { ALGEBRA_EXERCISES } from "../src/AlgebraExercise";
import { TOPICS } from "../src/topics";

const lines = [
  "# 知识与资源索引", "",
  "由 `node --import tsx scripts/knowledge-index.ts` 从内容库生成；不要手动修改。编辑过程和证据限制见 [CONTENT_LOG.md](CONTENT_LOG.md)。", "",
  `当前收录 ${articles.length} 篇文章、${concepts.length} 个概念、${edges.length} 条编辑关联。`, "",
  "这里的核验日期是内容库的编辑记录，不等于独立专家审稿。链接不构成转载授权；不得把用户提供的整本教材发布到仓库。", "",
  "## 概念总表", "",
  "| ID | 概念 | 学科 | 定义与边界 | 对应文章 |", "| --- | --- | --- | --- | --- |",
  ...concepts.map(c => `| ${c.id} | ${c.name} / ${c.zh} | ${c.subject} | ${c.description.replaceAll("|", "\\|")} | ${articles.filter(a => a.concepts.includes(c.id)).map(a => a.id).join(", ")} |`), "",
  "## 文章与来源", "",
];
for (const a of articles) {
  lines.push(`### ${a.id}`, "", `**${a.title}** · ${a.subject} · ${a.contentType}`, "",
    `- 核心问题：${a.question}`, `- 前置知识：${a.prerequisites.join("；")}`,
    `- 概念：${a.concepts.join(", ")}`, `- 交互：${a.lab}；${a.labIntro}`,
    `- 首发：${a.publishedAt}；记录中的核验日期：${a.verifiedAt}`, `- 核验说明：${a.verification}`, "",
    ...a.sections.map(s => `- ${s.title}：${s.blocks.filter(b => b.kind === "text").map(b => b.body).join(" ")}`), "",
    "参考资料：", "", ...a.sources.map(s => `- [${s.title}](${s.url}) — ${s.note}`), "");
}
lines.push("## 编辑关联", "", ...edges.map(e => `- ${e.from} → ${e.to}：${e.label}`), "");
lines.push("## 专题学习路径", "", ...TOPICS.map(t=>`- ${t.zh}：${t.lessons.join(" → ")}`), "", "## 教材练习记录", "", ...Object.entries(ALGEBRA_EXERCISES).map(([id,e])=>`- ${id} · ${e.citation} — ${e.zh}`), "");
writeFileSync(new URL("../KNOWLEDGE_INDEX.md", import.meta.url), lines.join("\n"));
