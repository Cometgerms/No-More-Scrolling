import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Publisher headlines and links only: no article bodies, images or generated claims.
const response = await fetch("https://feeds.bbci.co.uk/news/world/rss.xml", { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`World feed: HTTP ${response.status}`);
const xml = await response.text();
if (xml.length > 2_000_000) throw new Error("Feed too large");
const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const field = (item, name) => decode(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "");
const rules = [
  ["middle-east", /\b(iran|israel|gaza|lebanon|syria|iraq|yemen|palestin|saudi)/i],
  ["europe", /\b(ukraine|russia|europe|german|france|french|britain|british|nato|italy|spain|poland)/i],
  ["africa", /\b(africa|sudan|kenya|nigeria|congo|ethiopia|somalia|egypt)/i],
  ["asia", /\b(china|chinese|taiwan|japan|korea|india|pakistan|afghan|myanmar|philippin|australia)/i],
  ["americas", /\b(us|u\.s\.|america|trump|canada|mexico|brazil|argentina|venezuela)/i],
];
const seen = new Set();
const events = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]) => {
  const title = field(item, "title"), url = field(item, "link"), date = Date.parse(field(item, "pubDate"));
  if (!title || !url.startsWith("https://") || !Number.isFinite(date) || date > Date.now() + 300000 || seen.has(url)) return [];
  seen.add(url);
  return [{ id: createHash("sha256").update(url).digest("hex").slice(0, 16), title, url, publishedAt: new Date(date).toISOString(), region: rules.find(([, regex]) => regex.test(title))?.[0] ?? "global", source: "BBC News" }];
}).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 8);
if (!events.length) throw new Error("No valid source entries; refusing to replace previous feed");
await writeFile("public/world-feed.json", JSON.stringify({ version: 1, fetchedAt: new Date().toISOString(), events }, null, 2) + "\n");
console.log(`World brief: ${events.length} publisher headlines fetched.`);
