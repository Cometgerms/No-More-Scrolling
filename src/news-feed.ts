export const NEWS_SOURCES = [
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "DW", url: "https://rss.dw.com/rdf/rss-en-all" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
];
const rules = [
  ["middle-east", /\b(iran|israel|gaza|lebanon|syria|iraq|yemen|palestin|saudi)/i],
  ["europe", /\b(ukraine|russia|europe|german|france|french|britain|british|nato|italy|spain|poland)/i],
  ["africa", /\b(africa|sudan|kenya|nigeria|congo|ethiopia|somalia|egypt)/i],
  ["asia", /\b(china|chinese|taiwan|japan|korea|india|pakistan|afghan|myanmar|philippin|australia)/i],
  ["americas", /\b(us|u\.s\.|america|trump|canada|mexico|brazil|argentina|venezuela)/i],
] as const;
const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]+>/g,"").replace(/&#(x[\da-f]+|\d+);/gi,(_,n:string) => { const v=n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n); return v>0 && v<=0x10ffff ? String.fromCodePoint(v):""; }).replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
/** @requires Bounded RSS, no XML entities or remote resources are resolved. @ensures Only safe headline links enter the snapshot. */
export function parseHeadlines(xml: string, source: string, now = Date.now()) {
  if (xml.length > 2_000_000) throw Error("Feed too large");
  const field = (item: string, name: string) => decode(item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1] ?? "");
  const seen = new Set<string>();
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/g)].flatMap(([,item]) => {
    const title=field(item,"title"), link=field(item,"link"), date=Date.parse(field(item,"pubDate") || field(item,"dc:date"));
    let url: URL; try { url=new URL(link); } catch { return []; }
    if (!title || title.length>2000 || url.protocol!=="https:" || url.username || url.password || !Number.isFinite(date) || date>now+300000 || now-date>7*86400000) return [];
    url.hash="";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|CMP$|at_)/i.test(key)) url.searchParams.delete(key);
    if (seen.has(url.href)) return []; seen.add(url.href);
    return [{title,url:url.href,publishedAt:new Date(date).toISOString(),region:rules.find(([,regex])=>regex.test(title))?.[0] ?? "global",source}];
  }).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,4);
}
