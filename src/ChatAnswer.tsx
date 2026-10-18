import { Fragment } from "react";
import { MathText } from "./Math";

/** @requires Untrusted model output. @ensures HTML stays escaped and links use HTTPS. */
function Inline({ text }: { text: string }) {
  return <>{text.split(/(\\\([\s\S]*?\\\)|\$[^$\n]+\$|`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https:\/\/[^\s)]+\))/g).map((part, i) => {
    if (part.startsWith("\\(")) return <MathText key={i} value={part.slice(2,-2)} display={false} />;
    if (part.startsWith("$") && part.endsWith("$")) return <MathText key={i} value={part.slice(1,-1)} display={false} />;
    if (part.startsWith("`")) return <code key={i}>{part.slice(1,-1)}</code>;
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  })}</>;
}
export function ChatAnswer({ text }: { text: string }) {
  return <div className="chat-prose">{text.split(/(```[\s\S]*?```|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$)/g).map((part, i) => {
    if (part.startsWith("```")) return <pre key={i}><code>{part.slice(3,-3).replace(/^[\w+-]*\n/, "")}</code></pre>;
    if (part.startsWith("\\[") || part.startsWith("$$")) return <MathText key={i} value={part.slice(2,-2)} />;
    const lines = part.split("\n"), blocks = [];
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (!line.trim()) continue;
      if (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[j+1] ?? "")) {
        const cells = (s: string) => s.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        const heads = cells(line), rows = []; j += 2;
        while (j < lines.length && lines[j].includes("|")) { rows.push(cells(lines[j])); j++; } j--;
        blocks.push(<div className="chat-table" key={j}><table><thead><tr>{heads.map((h,k) => <th key={k}><Inline text={h} /></th>)}</tr></thead><tbody>{rows.map((r,k) => <tr key={k}>{r.map((v,n) => <td key={n}><Inline text={v} /></td>)}</tr>)}</tbody></table></div>);
      } else if (/^#{1,6}\s/.test(line)) blocks.push(<h3 key={j}><Inline text={line.replace(/^#+\s/, "")} /></h3>);
      else if (/^\s*(?:[-*]|\d+\.)\s/.test(line)) {
        const ordered = /^\s*\d+\./.test(line), items = [], pattern = ordered ? /^\s*\d+\.\s/ : /^\s*[-*]\s/;
        while (j < lines.length && pattern.test(lines[j])) { items.push(lines[j].replace(pattern, "")); j++; } j--;
        const List = ordered ? "ol" : "ul";
        blocks.push(<List key={j}>{items.map((v,k) => <li key={k}><Inline text={v} /></li>)}</List>);
      } else blocks.push(<p key={j}><Inline text={line} /></p>);
    }
    return <Fragment key={i}>{blocks}</Fragment>;
  })}</div>;
}
