import { useLanguage } from "./i18n";
import katex from "katex";
import { useMemo } from "react";
import type { Section } from "./model";
import { ConceptFigure } from "./ConceptFigure";
export function MathText({
  value,
  display = true,
}: {
  value: string;
  display?: boolean;
}) {
  const { t } = useLanguage();

  const html = useMemo(
    () =>
      katex.renderToString(value, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "htmlAndMathml",
      }),
    [value, display],
  );
  const Tag = display ? "div" : "span";
  return (
    <Tag className={display ? "formula-panel" : undefined}>
      {display && (
        <span className="formula-label">{t("MATH NOTE · 长公式可左右滑动")}</span>
      )}
      <Tag
        className={display ? "formula" : "inline-math"}
        tabIndex={display ? 0 : undefined}
        role={display ? "region" : undefined}
        aria-label={display ? t("数学公式") : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Tag>
  );
}
/** @requires TeX is delimited by \( and \). @ensures Plain text stays escaped by React. */
export function RichText({ value }: { value: string }) {
  return (
    <>
      {value.split(/(\\\([\s\S]*?\\\))/g).map((part, i) =>
        part.startsWith("\\(") && part.endsWith("\\)") ? (
          <MathText key={i} value={part.slice(2, -2)} display={false} />
        ) : part,
      )}
    </>
  );
}
export function Prose({ section }: { section: Section }) {
  return (
    <div className="prose">
      <h2>{section.title}</h2>
      {section.blocks.map((b, i) =>
        b.kind === "figure" ? (
          <ConceptFigure key={i} kind={b.body} />
        ) : b.kind === "math" ? (
          <MathText key={i} value={b.body} />
        ) : b.kind === "note" ? (
          <aside className="callout" key={i}>
            <span className="eyebrow">{b.label}</span>
            <p><RichText value={b.body} /></p>
          </aside>
        ) : b.kind === "code" ? (
          <pre key={i}>
            <code>{b.body}</code>
          </pre>
        ) : (
          <p key={i}><RichText value={b.body} /></p>
        ),
      )}
    </div>
  );
}
