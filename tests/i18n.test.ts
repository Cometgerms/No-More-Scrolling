import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import katex from "katex";
import { articles, concepts, edges } from "../src/content";
import { initialState } from "../src/model";
import { LanguageProvider, localizeContent, translate } from "../src/i18n";
import { Prose } from "../src/Math";
import { Lab } from "../src/Labs";
import { Graph } from "../src/Graph";

const english = localizeContent({ articles, concepts, edges }, "en");
const han = /[\u3400-\u9fff]/;
function renderEnglish(element: React.ReactNode) {
  return renderToStaticMarkup(React.createElement(LanguageProvider, { initialLanguage: "en", children: element }));
}

test("all eight English articles and the curated graph are complete and keep stable identifiers", () => {
  assert.equal(english.articles.length, 8);
  assert.ok(!han.test(JSON.stringify(english)), "English content must not fall back to Chinese");
  assert.deepEqual(english.articles.map(a => a.id), articles.map(a => a.id));
  assert.deepEqual(english.concepts.map(c => c.id), concepts.map(c => c.id));
  for (const [i, article] of english.articles.entries()) {
    const original = articles[i];
    assert.equal(article.quiz.answer, original.quiz.answer);
    assert.equal(article.quiz.options.length, original.quiz.options.length);
    assert.deepEqual(article.concepts, original.concepts);
    assert.deepEqual(article.sources.map(s => s.url), original.sources.map(s => s.url));
    for (const [j, section] of [...article.sections, article.deep].entries()) {
      const originalSection = [...original.sections, original.deep][j];
      assert.equal(section.blocks.length, originalSection.blocks.length);
      for (const [k, block] of section.blocks.entries()) {
        if (["math", "code", "figure"].includes(block.kind)) assert.deepEqual(block, originalSection.blocks[k]);
      }
      assert.ok(!renderEnglish(React.createElement(Prose, { section })).includes("katex-error"));
    }
    for (const value of [article.quiz.question, ...article.quiz.options, ...article.quiz.explanations,
      ...[...article.sections, article.deep].flatMap(s => s.blocks.map(b => b.body))]) {
      for (const formula of value.matchAll(/\\\(([\s\S]*?)\\\)/g)) {
        assert.doesNotThrow(() => katex.renderToString(formula[1], { throwOnError: true }));
      }
    }
  }
});

test("every Chinese interface translation key has an English entry", () => {
  for (const file of ["App.tsx", "Labs.tsx", "Graph.tsx", "Math.tsx", "ConceptFigure.tsx", "main.tsx"]) {
    const source = ts.createSourceFile(file, readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t") {
        const key = node.arguments[0];
        if (key && ts.isStringLiteral(key) && han.test(key.text)) {
          assert.ok(!han.test(translate("en", key.text)), `${file}: ${key.text}`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});

test("all English labs and the concept graph render without untranslated interface text", () => {
  for (const article of english.articles) {
    const html = renderEnglish(React.createElement(Lab, { article }));
    assert.ok(!han.test(html), article.id);
    assert.ok(html.includes("THOUGHT LAB"));
  }
  const html = renderEnglish(React.createElement(Graph, {
    state: initialState, update: () => {}, open: () => {}, selected: "measure", setSelected: () => {},
  }));
  assert.ok(!han.test(html));
  assert.ok(html.includes("Countable additivity"));
});

test("localized messages interpolate in both languages without interpreting user text", () => {
  assert.equal(translate("en", "跳至第{0}节：{1}", 3, "An infinite address"), "Jump to section 3: An infinite address");
  assert.equal(translate("zh", "收藏 {0}", "我的原文 {1}"), "收藏 我的原文 {1}");
  assert.equal(translate("en", "not a catalog entry"), "not a catalog entry");
  assert.equal(translate("en", "  今日  "), "Today");
});

test("translation does not mutate the source corpus or stored user notes and progress", () => {
  const source = JSON.stringify({ articles, concepts, edges });
  const state = structuredClone(initialState);
  state.notes.measure = "我的原文；do not translate";
  state.progress[articles[0].id] = { section: 2, complete: false, answer: 1 };
  const before = JSON.stringify(state);
  localizeContent({ articles, concepts, edges }, "en");
  assert.equal(JSON.stringify({ articles, concepts, edges }), source);
  assert.equal(JSON.stringify(state), before);
});

test("English graph leaves personal notes and connection labels in their original language", () => {
  const state = structuredClone(initialState);
  state.notes.measure = "今日";
  state.edges = [{ from: "measure", to: "halting", label: "数学", personal: true }];
  const html = renderEnglish(React.createElement(Graph, {
    state, update: () => {}, open: () => {}, selected: "measure", setSelected: () => {},
  }));
  assert.ok(html.includes("今日"), "A note matching a translation key must still remain verbatim");
  assert.ok(html.includes("数学"), "Personal edge labels must not pass through the translation catalog");
  assert.ok(html.includes("Personal connection"));
});
