import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { NEWS_SOURCES, parseHeadlines } from "../src/news-feed.ts";

// Bound each publisher equally; a failed feed must not erase working sources.
const results = await Promise.allSettled(NEWS_SOURCES.map(async source => {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(20000), headers: { "User-Agent": "NoMoreScrolling/0.3 (headline reader)" } });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  const events = parseHeadlines(await response.text(),source.name);
  if (!events.length) throw Error("No recent headlines");
  return events;
}));
const seen = new Set();
const events = results.flatMap(r => r.status === "fulfilled" ? r.value : []).filter(e => { if (seen.has(e.url)) return false; seen.add(e.url); return true; }).map(e => ({ ...e,id:createHash("sha256").update(e.url).digest("hex").slice(0,16) }));
const sources = NEWS_SOURCES.map((s,i) => ({...s,ok:results[i].status === "fulfilled"}));
if (!events.length) { console.warn("All publishers unavailable; retaining the bundled snapshot."); process.exit(0); }
await writeFile("public/world-feed.json",JSON.stringify({version:1,fetchedAt:new Date().toISOString(),events,sources},null,2)+"\n");
console.log(`World feed: ${events.length} headlines, ${sources.filter(s=>s.ok).length}/${sources.length} publishers.`);
