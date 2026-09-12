import React, { useEffect, useState } from 'react';

async function request(path, options = {}) {
  const response = await fetch('/api' + path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Server unavailable.');
  return body;
}

export function ServerGate({ children }) {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Connecting to the server…');
  const [failure, setFailure] = useState('');
  async function connect() {
    const { records } = await request('/records');
    const cache = new Map(records.map(row => [row.key, row]));
    const readKeys = new Set();
    const revisions = new Map(records.map(row => [row.key, row.revision]));
    const queues = new Map();
    let failed = false;
    const guarded = async action => {
      if (failed) throw new Error('Reload required.');
      try { return await action(); } catch (error) { failed = true; setFailure(error.message); throw error; }
    };
    const mutate = (key, method, value) => {
      const pending = (queues.get(key) || Promise.resolve()).then(() => guarded(async () => {
        const row = await request('/records/' + encodeURIComponent(key), { method, body: JSON.stringify({ value, revision: revisions.get(key) || 0 }) });
        revisions.set(key, row.revision); cache.set(key, row);
        return row;
      }));
      queues.set(key, pending.catch(() => {}));
      return pending;
    };
    window.storage = {
      get: key => guarded(async () => {
        // Initial app reads come from one complete snapshot. Later polls refresh values,
        // but never advance write revisions behind an editor's stale state.
        const row = !readKeys.has(key) ? (cache.get(key) || { key, value: null, revision: 0 }) : await request('/records/' + encodeURIComponent(key));
        readKeys.add(key);
        if (!revisions.has(key)) revisions.set(key, 0);
        return row.value === null ? null : row;
      }),
      set: (key, value) => mutate(key, 'PUT', value),
      delete: key => mutate(key, 'DELETE'),
    };
    setReady(true);
  }
  useEffect(() => { connect().catch(error => setMessage(error.message)); }, []);
  const panel = { minHeight: '100vh', background: '#1A0E2B', color: '#fff', fontFamily: 'system-ui', display: 'grid', placeItems: 'center', padding: 24, boxSizing: 'border-box' };
  if (failure) return <div style={panel}><div style={{ maxWidth: 480 }}><h1>Changes paused</h1><p>{failure}</p><p>Your last change may not have saved. Reload to fetch the server copy, then enter that change again.</p><button onClick={() => location.reload()}>Reload server data</button></div></div>;
  if (ready) return children;
  return <div style={panel}><form style={{ maxWidth: 400, width: '100%' }} onSubmit={async event => { event.preventDefault(); setMessage('Connecting…'); try { await request('/login', { method: 'POST', body: JSON.stringify({ password }) }); setPassword(''); await connect(); } catch (error) { setMessage(error.message); } }}><h1>Sentinel server</h1><p>Enter the server access password to open the shared weight room.</p><label htmlFor="server-password">Server password</label><input id="server-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, margin: '12px 0' }}/><button type="submit" style={{ padding: '12px 20px' }}>Connect</button><p role="status">{message}</p></form></div>;
}
