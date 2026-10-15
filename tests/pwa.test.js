import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('PWA manifest is installable and scoped to this app', async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'/');
  assert.ok(manifest.icons.some(icon=>icon.src==='/icons/icon-192.png'&&icon.sizes==='192x192'));
  assert.ok(manifest.icons.some(icon=>icon.src==='/icons/icon-512.png'&&icon.sizes==='512x512'));
});

test('service worker caches the shell and never caches API responses', async()=>{
  const worker=await readFile(new URL('../public/sw.js',import.meta.url),'utf8');
  assert.match(worker,/caches\.open\(CACHE\)/);
  assert.match(worker,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker,/caches\.match\('\/offline\.html'\)/);
});

test('hosted Render mode is stateless and enabled by the free blueprint', async()=>{
  const server=await readFile(new URL('../server/index.js',import.meta.url),'utf8');
  const blueprint=await readFile(new URL('../render.yaml',import.meta.url),'utf8');
  assert.match(server,/HOSTED_MODE==='true'/);
  assert.match(blueprint,/HOSTED_MODE[\s\S]*value: "true"/);
  assert.match(blueprint,/plan: free/);
});
