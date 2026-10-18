import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function worker(fail = false) {
  const handlers: Record<string, Function> = {};
  const stores = new Map<string, Map<string, Response>>();
  const scope = 'https://example.com/No-More-Scrolling/';
  const calls: Request[] = [];
  const key = (r: any) => typeof r === 'string' ? r : r.url;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name)!;
      return { put: async (r: any, v: Response) => entries.set(key(r), v), match: async (r: any) => entries.get(key(r)) };
    },
  };
  runInNewContext(readFileSync('scripts/sw-runtime.js', 'utf8'), {
    CACHE: 'nms-new', ASSETS: [['./index.html', 'sha256-test']], caches, URL, Request,
    fetch: async (r: Request) => { calls.push(r); if (fail) throw Error('Integrity mismatch'); return new Response('new shell'); },
    self: { registration: { scope }, clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (name: string, fn: Function) => handlers[name] = fn },
  });
  const fire = (name: string, extra = {}) => {
    let result: Promise<any> = Promise.resolve();
    handlers[name]({ ...extra, waitUntil: (p: Promise<any>) => result = p, respondWith: (p: Promise<any>) => result = p });
    return result;
  };
  return { stores, calls, scope, caches, fire };
}

test('install bypasses HTTP cache and requests exact build integrity', async () => {
  const w = worker(); await w.fire('install');
  assert.equal(w.calls[0].cache, 'reload');
  assert.equal(w.calls[0].integrity, 'sha256-test');
  assert.equal(await (await w.caches.open('nms-new')).match(w.scope + 'index.html')?.then(r => r?.text()), 'new shell');
});
test('failed install removes partial build and preserves working build', async () => {
  const w = worker(true); await w.caches.open('nms-old');
  await assert.rejects(w.fire('install'), /Integrity/);
  assert.deepEqual([...w.stores.keys()], ['nms-old']);
});
test('activation retains two previous builds and unrelated caches', async () => {
  const w = worker();
  for (const name of ['other-app', 'nms-oldest', 'nms-older', 'nms-old']) await w.caches.open(name);
  await w.fire('install'); await w.fire('activate');
  assert.deepEqual([...w.stores.keys()], ['other-app', 'nms-older', 'nms-old', 'nms-new']);
});
test('new navigation uses new shell while old tabs can request old bundles', async () => {
  const w = worker(); const old = await w.caches.open('nms-old');
  await old.put(w.scope + 'assets/old-hash.js', new Response('old bundle'));
  await old.put(w.scope + 'world-feed.json', new Response('stale news'));
  await w.fire('install'); await w.fire('activate');
  const request = (path: string, mode = 'cors') => ({ method: 'GET', url: w.scope + path, mode });
  assert.equal(await (await w.fire('fetch', { request: request('', 'navigate') })).text(), 'new shell');
  assert.equal(await (await w.fire('fetch', { request: request('assets/old-hash.js') })).text(), 'old bundle');
  await w.fire('fetch', { request: request('world-feed.json') });
  assert.equal(w.calls.length, 2);
});
