import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`,
      ),
    )
  ).flat();
}
const files = (await walk("dist")).filter((f) => !f.endsWith("/sw.js"));
const hash = createHash("sha256");
for (const file of files.sort()) hash.update(await readFile(file));
const version = `nms-${hash.digest("hex").slice(0, 12)}`;
const assets = files.map((f) => "./" + f.slice(5));
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(version)};\nconst ASSETS=${JSON.stringify(assets)};\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nms-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();});\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;const url=new URL(e.request.url);if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;e.respondWith((async()=>{const cache=await caches.open(CACHE);if(e.request.mode==='navigate'){return(await cache.match('./index.html'))||fetch(e.request);}return(await cache.match(e.request))||fetch(e.request);})());});\n`,
);
console.log(
  `Offline cache ${version}: ${assets.length} local assets (including math fonts).`,
);
