import { readFile, writeFile } from "node:fs/promises";
import { parseFeed } from "../src/world-data";
import { archiveAnalysis, generateAnalysis, parseAnalysisArchive, type AnalysisArchive } from "../src/world-analysis";

const today = new Date().toISOString().slice(0,10);
let archive: AnalysisArchive = {version:1,status:"unconfigured",editions:[]};
try { archive=parseAnalysisArchive(JSON.parse(await readFile("public/world-analysis.json","utf8"))); } catch { /* First release. */ }
if (process.env.WORLD_ARCHIVE_URL) {
  try {
    const url = new URL(process.env.WORLD_ARCHIVE_URL);
    if (url.protocol!=="https:" || url.username || url.password) throw Error("Invalid archive URL");
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
    if (response.status !== 404) {
      if (!response.ok) throw Error("Archive unavailable");
      const body=await response.text(); if (body.length>4_000_000) throw Error("Archive too large");
      archive=parseAnalysisArchive(JSON.parse(body));
    }
  } catch { throw Error("Could not retrieve published analysis history; refusing to replace it. Retry the workflow later."); }
}
const config={endpoint:process.env.WORLD_AI_ENDPOINT ?? "",model:process.env.WORLD_AI_MODEL ?? "",key:process.env.WORLD_AI_KEY ?? ""};
if (!config.key || !config.endpoint || !config.model) {
  archive.status="unconfigured"; console.log("Daily AI analysis is not configured; news remains available.");
} else if (process.env.WORLD_GENERATE === "true" && !archive.editions.some(e=>e.generatedAt.slice(0,10)===today)) {
  try {
    const feed=parseFeed(JSON.parse(await readFile("public/world-feed.json","utf8")));
    if (feed.fetchedAt.slice(0,10)!==today || new Set(feed.events.map(e=>e.source)).size<2) throw Error("Fresh multi-source evidence required");
    const zh=await generateAnalysis(config,feed,"zh",AbortSignal.timeout(90000));
    const en=await generateAnalysis(config,feed,"en",AbortSignal.timeout(90000));
    archive={version:1,status:"ready",editions:archiveAnalysis(archive.editions,{generatedAt:new Date().toISOString(),feedAt:feed.fetchedAt,events:feed.events,zh,en})};
    console.log("Generated bilingual daily analysis.");
  } catch { archive.status="failed"; console.warn("Analysis failed; preserving earlier editions. Check provider configuration and quota."); }
}
if (config.key && config.endpoint && config.model && (process.env.WORLD_GENERATE !== "true" || archive.editions.some(e=>e.generatedAt.slice(0,10)===today))) archive.status="ready";
await writeFile("public/world-analysis.json",JSON.stringify(archive,null,2)+"\n");
