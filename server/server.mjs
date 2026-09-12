import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function createApp({ databasePath, password, publicOrigin, secureCookie = true, staticDir = resolve('dist') }) {
  if (!password || password.length < 16) throw new Error('Set SENTINEL_PASSWORD to at least 16 characters.');
  const origin = new URL(publicOrigin).origin;
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, value TEXT, revision INTEGER NOT NULL);');
  const sessions = new Map();
  const attempts = new Map();
  const hash = value => createHash('sha256').update(value).digest();
  const expected = hash(password);
  const send = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
  const readBody = async req => {
    let body = ''; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) throw Object.assign(new Error('Record exceeds 8 MB.'), { status: 413 });
      body += chunk;
    }
    try { return JSON.parse(body); } catch { throw Object.assign(new Error('Invalid JSON.'), { status: 400 }); }
  };
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    try {
      const url = new URL(req.url, origin);
      if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { ok: true });
      if (url.pathname.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin !== origin) return send(res, 403, { error: 'Origin rejected.' });
        if (url.pathname === '/api/login' && req.method === 'POST') {
          const ip = req.socket.remoteAddress;
          const now = Date.now();
          for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
          for (const [key, value] of sessions) if (value <= now) sessions.delete(key);
          const entry = attempts.get(ip) || { count: 0, until: now + 900000 };
          if (entry.count >= 10) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
          const body = await readBody(req);
          if (typeof body.password !== 'string' || !timingSafeEqual(hash(body.password), expected)) {
            entry.count++; attempts.set(ip, entry);
            return send(res, 401, { error: 'Incorrect server password.' });
          }
          attempts.delete(ip);
          if (sessions.size >= 10000) return send(res, 503, { error: 'Session capacity reached.' });
          const token = randomBytes(32).toString('hex');
          sessions.set(token, now + 12 * 3600000);
          res.setHeader('Set-Cookie', `sentinel_session=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=43200${secureCookie ? '; Secure' : ''}`);
          return send(res, 200, { ok: true });
        }
        const token = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('sentinel_session='))?.slice(17);
        if (!token || (sessions.get(token) || 0) <= Date.now()) return send(res, 401, { error: 'Sign in to the server.' });
        if (url.pathname === '/api/records' && req.method === 'GET') return send(res, 200, { records: db.prepare('SELECT key, value, revision FROM records').all() });
        if (url.pathname.startsWith('/api/records/')) {
          const key = decodeURIComponent(url.pathname.slice('/api/records/'.length));
          if (!key || key.length > 250 || /[\x00-\x1f]/.test(key)) return send(res, 400, { error: 'Invalid key.' });
          if (req.method === 'GET') return send(res, 200, db.prepare('SELECT key, value, revision FROM records WHERE key = ?').get(key) || { key, value: null, revision: 0 });
          if (req.method === 'PUT' || req.method === 'DELETE') {
            const body = await readBody(req);
            if (!Number.isSafeInteger(body.revision) || body.revision < 0) return send(res, 400, { error: 'A revision is required.' });
            if (req.method === 'PUT') {
              if (typeof body.value !== 'string') return send(res, 400, { error: 'Value must be JSON text.' });
              try { JSON.parse(body.value); } catch { return send(res, 400, { error: 'Value must be valid JSON.' }); }
            }
            const current = db.prepare('SELECT revision FROM records WHERE key = ?').get(key);
            if ((current?.revision || 0) !== body.revision) return send(res, 409, { error: 'Another device changed this record. Reload before editing again.' });
            const revision = body.revision + 1;
            const value = req.method === 'DELETE' ? null : body.value;
            db.prepare('INSERT INTO records(key,value,revision) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, revision=excluded.revision').run(key, value, revision);
            return send(res, 200, { key, value, revision });
          }
        }
        return send(res, 404, { error: 'API route not found.' });
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
      const root = resolve(staticDir);
      const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!path.startsWith(root + sep)) return send(res, 403, { error: 'Forbidden.' });
      if (!statSync(path, { throwIfNoEntry: false })?.isFile()) return send(res, 404, { error: 'Not found.' });
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': path.endsWith('.html') ? 'no-cache' : 'public, max-age=3600' });
      res.end(req.method === 'HEAD' ? undefined : readFileSync(path));
    } catch (error) { send(res, error.status || 500, { error: error.status ? error.message : 'Server error. Check server logs.' }); if (!error.status) console.error(error); }
  });
  server.on('close', () => db.close());
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp({ databasePath: resolve(process.env.DATA_DIR || 'data', 'sentinel.sqlite'), password: process.env.SENTINEL_PASSWORD, publicOrigin: process.env.PUBLIC_ORIGIN, secureCookie: process.env.COOKIE_SECURE !== 'false' });
  server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Sentinel listening on port ' + (process.env.PORT || 3000)));
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
}
