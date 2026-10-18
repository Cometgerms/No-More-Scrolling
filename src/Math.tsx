import katex from "katex";
import { useMemo } from "react";
import type { Section } from "./model";
export function MathText({
  value,
  display = true,
}: {
  value: string;
  display?: boolean;
}) {
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
  return (
    <div
      className={display ? "formula" : "inline-math"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
export function Prose({ section }: { section: Section }) {
  return (
    <div className="prose">
      <h2>{section.title}</h2>
      {section.blocks.map((b, i) =>
        b.kind === "math" ? (
          <MathText key={i} value={b.body} />
        ) : b.kind === "note" ? (
          <aside className="callout" key={i}>
            <span className="eyebrow">{b.label}</span>
            <p>{b.body}</p>
          </aside>
        ) : b.kind === "code" ? (
          <pre key={i}>
            <code>{b.body}</code>
          </pre>
        ) : (
          <p key={i}>{b.body}</p>
        ),
      )}
    </div>
  );
}
