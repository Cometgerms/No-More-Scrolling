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
const files = (await walk("dist")).filter((f) => !f.endsWith("/sw.js") && !f.endsWith("/world-feed.json"));
const runtime = await readFile("scripts/sw-runtime.js", "utf8");
const hash = createHash("sha256").update(runtime);
for (const file of files.sort()) hash.update(await readFile(file));
const version = `nms-${hash.digest("hex").slice(0, 12)}`;
const assets = await Promise.all(files.map(async (f) => ["./" + f.slice(5), "sha256-" + createHash("sha256").update(await readFile(f)).digest("base64")]));
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(version)};\nconst ASSETS=${JSON.stringify(assets)};\n${runtime}`,
);
console.log(
  `Offline cache ${version}: ${assets.length} local assets (including math fonts).`,
);
