export const regions = ["global", "americas", "europe", "africa", "asia", "middle-east"] as const;
export type Region = typeof regions[number];
export type WorldEvent = { id: string; title: string; region: Region; publishedAt: string; url: string; source: string };
export type WorldFeed = { version: 1; fetchedAt: string; events: WorldEvent[] };

export function httpsUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("HTTPS required");
  return url.href;
}

/** @requires Untrusted feed JSON. @ensures Only bounded, source-linked entries enter the UI. */
export function parseFeed(value: unknown): WorldFeed {
  const feed = value as WorldFeed;
  if (!feed || feed.version !== 1 || !validDate(feed.fetchedAt) || !Array.isArray(feed.events) || feed.events.length > 40) throw new Error("Invalid feed");
  const seen = new Set<string>();
  for (const e of feed.events) {
    if (!e || ![e.id, e.title, e.source, e.url].every(s => typeof s === "string" && s.length > 0 && s.length <= 2000) || !regions.includes(e.region) || !validDate(e.publishedAt) || seen.has(e.id)) throw new Error("Invalid event");
    httpsUrl(e.url);
    seen.add(e.id);
  }
  return { version: 1, fetchedAt: feed.fetchedAt, events: [...feed.events].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 8) };
}
function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 300_000;
}
