import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import { articles } from "../src/content";
import { MathText, Prose, RichText } from "../src/Math";

test("inline math stays inside a paragraph and surrounding text cannot inject HTML", () => {
  const html = renderToStaticMarkup(React.createElement("p", null,
    React.createElement(RichText, { value: String.raw`事件 \(A\subseteq\Omega\)，概率 \(\mathbb P(A)=0\)。<script>alert(1)</script>` }),
  ));
  assert.equal((html.match(/class="inline-math"/g) ?? []).length, 2);
  assert.ok(html.includes("<math"));
  assert.ok(!html.includes("<div"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("all article, callout and quiz inline formulas use valid TeX and matched delimiters", () => {
  for (const article of articles) {
    const values = [article.quiz.question, ...article.quiz.options, ...article.quiz.explanations,
      ...[...article.sections, article.deep].flatMap(s => s.blocks.filter(b => b.kind === "text" || b.kind === "note").map(b => b.body))];
    for (const value of values) {
      const formulas = [...value.matchAll(/\\\(([\s\S]*?)\\\)/g)];
      assert.equal((value.match(/\\\(/g) ?? []).length, formulas.length, value);
      assert.equal((value.match(/\\\)/g) ?? []).length, formulas.length, value);
      for (const formula of formulas) assert.doesNotThrow(() => katex.renderToString(formula[1], { throwOnError: true }));
    }
    for (const section of [...article.sections, article.deep]) {
      const html = renderToStaticMarkup(React.createElement(Prose, { section }));
      assert.ok(!html.includes("katex-error"), section.title);
      for (const block of section.blocks) {
        if (block.kind === "math") assert.ok(!/[\t\r]/.test(block.body), "TeX commands must not become string escape characters");
        if (block.kind === "figure") assert.ok(html.includes("<figure"));
      }
    }
  }
});

test("display formulas expose a focusable scroll region and accessible MathML", () => {
  const html = renderToStaticMarkup(React.createElement(MathText, { value: String.raw`\sum_{n=1}^{\infty}2^{-n}=1` }));
  assert.ok(html.includes('role="region"'));
  assert.ok(html.includes('tabindex="0"'));
  assert.ok(html.includes("<math"));
});
