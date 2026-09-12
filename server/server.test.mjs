import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './server.mjs';

test('authentication, origin checks, durable storage and stale write protection', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'sentinel-test-'));
  const options = { databasePath: join(directory, 'test.sqlite'), password: 'test-only-password-12345', publicOrigin: 'http://localhost:3000', secureCookie: false };
  let server;
  async function start() { server = createApp(options); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); return 'http://127.0.0.1:' + server.address().port; }
  async function stop() { await new Promise(resolve => server.close(resolve)); }
  try {
    let base = await start();
    const login = async () => {
      const response = await fetch(base + '/api/login', { method: 'POST', headers: { Origin: options.publicOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: options.password }) });
      assert.equal(response.status, 200); return response.headers.get('set-cookie').split(';')[0];
    };
    assert.equal((await fetch(base + '/api/records')).status, 401);
    let cookie = await login();
    const write = (revision, value = '{"sets":3}', origin = options.publicOrigin, method = 'PUT') => fetch(base + '/api/records/example', { method, headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ revision, value }) });
    assert.equal((await write(0, '{}', 'http://evil.test')).status, 403);
    assert.equal((await write(0, 'invalid')).status, 400);
    assert.equal((await write(0)).status, 200);
    assert.equal((await write(0)).status, 409);
    await stop(); base = await start(); cookie = await login();
    const row = await (await fetch(base + '/api/records/example', { headers: { Cookie: cookie } })).json();
    assert.equal(row.value, '{"sets":3}'); assert.equal(row.revision, 1);
    assert.equal((await write(1, undefined, options.publicOrigin, 'DELETE')).status, 200);
    assert.equal((await write(0)).status, 409);
    assert.equal((await write(2)).status, 200);
  } finally { if (server?.listening) await stop(); rmSync(directory, { recursive: true, force: true }); }
});
