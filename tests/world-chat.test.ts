import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chatPayload, requestAnswer, validateChatConfig } from "../src/chat";
import { parseFeed } from "../src/world-data";

const fixture = () => ({ version: 1, fetchedAt: "2025-01-01T12:00:00Z", events: [{ id: "one", title: "A headline", region: "global", source: "Publisher", publishedAt: "2025-01-01T10:00:00Z", url: "https://example.com/story" }] });
test("feed rejects unsafe links, unknown regions, duplicate identities and invalid timestamps", () => {
  for (const mutate of [
    (f: ReturnType<typeof fixture>) => { f.events[0].url = "javascript:alert(1)"; },
    (f: ReturnType<typeof fixture>) => { f.events[0].region = "unknown"; },
    (f: ReturnType<typeof fixture>) => { f.events.push(f.events[0]); },
    (f: ReturnType<typeof fixture>) => { f.fetchedAt = "tomorrow"; },
    (f: ReturnType<typeof fixture>) => { f.events[0].publishedAt = "2099-01-01"; },
  ]) { const value = fixture(); mutate(value); assert.throws(() => parseFeed(value)); }
});
test("feed is bounded, chronologically sorted, and local publisher snapshot is valid", () => {
  const value = fixture();
  value.events = Array.from({ length: 12 }, (_, i) => ({ ...value.events[0], id: String(i), publishedAt: `2024-12-${String(i+1).padStart(2,"0")}T10:00:00Z` }));
  const result = parseFeed(value);
  assert.equal(result.events.length, 12); assert.equal(result.events[0].id, "11");
  assert.equal(value.events.length, 12);
  const feed = parseFeed(JSON.parse(readFileSync(new URL("../public/world-feed.json", import.meta.url), "utf8")));
  assert.ok(feed.events.length > 0);
});
test("chat config rejects plaintext transport and credentials embedded in URLs", () => {
  for (const endpoint of ["http://api.example.com/chat", "https://key@api.example.com/chat", "https://api.example.com/chat?key=secret", "javascript:alert(1)"]) {
    assert.throws(() => validateChatConfig({ endpoint, key: "secret", model: "model" }));
  }
});
test("chat context is explicit, bounded, optional, and does not include configuration", () => {
  const page = { id: "read/one", title: "One", text: "x".repeat(20000) };
  const payload = chatPayload("test", [{ role: "user", content: "Why?" }], page, "en");
  assert.equal(payload.messages.length, 3);
  assert.ok(payload.messages[1].content.length < 15000);
  assert.equal(chatPayload("test", [], null, "zh").messages.length, 1);
  assert.ok(payload.messages[0].content.includes("no live search"));
});
test("chat request carries key only as authorization, rejects redirects and returns provider text", async () => {
  let captured: RequestInit | undefined;
  const mock = (async (_url, init) => { captured = init; return new Response(JSON.stringify({ choices: [{ message: { content: "Answer \\(x^2\\)" } }] })); }) as typeof fetch;
  const answer = await requestAnswer({ endpoint: "https://example.com/chat", model: "model", key: "test-only-secret" }, [{ role: "user", content: "Question" }], null, "en", new AbortController().signal, mock);
  assert.equal(answer, "Answer \\(x^2\\)");
  assert.equal(captured?.redirect, "error");
  assert.equal(captured?.credentials, "omit");
  assert.ok(!String(captured?.body).includes("test-only-secret"));
  assert.equal((captured?.headers as Record<string, string>).Authorization, "Bearer test-only-secret");
});
test("chat errors never echo provider bodies that could contain credentials", async () => {
  const config = { endpoint: "https://example.com/chat", model: "model", key: "secret" };
  await assert.rejects(requestAnswer(config, [], null, "en", new AbortController().signal, (async () => new Response("secret", { status: 401 })) as typeof fetch), { message: "HTTP 401" });
  await assert.rejects(requestAnswer(config, [], null, "en", new AbortController().signal, (async () => new Response('{"choices":[]}')) as typeof fetch), { message: "empty" });
});
