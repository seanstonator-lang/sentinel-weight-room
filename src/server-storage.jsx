import { AccountLogin } from './account-login.jsx';
import React, { useEffect, useState } from 'react';
import { mergeRecords } from './merge-records.js';

async function request(path, options = {}) {
  const response = await fetch('/api' + path, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error || 'Server unavailable.'), { status: response.status });
  return body;
}

export function ServerGate({ children }) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Connecting to the server…');
  const [failure, setFailure] = useState('');
  async function connect() {
    const { records, identity } = await request('/records');
    window.sentinelIdentity = identity;
    window.sentinelLogout = async () => { await request('/logout',{method:'POST',body:'{}'}); window.location.reload(); };
    const cache = new Map(records.map(row => [row.key, row]));
    const readKeys = new Set();
    const revisions = new Map(records.map(row => [row.key, row.revision]));
    const localValues = new Map(records.map(row => [row.key, row.value]));
    const queues = new Map();
    let failed = false;
    const guarded = async action => {
      if (failed) throw new Error('Reload required.');
      try { return await action(); } catch (error) { failed = true; setFailure(error.message); throw error; }
    };
    const mutate = (key, method, value) => {
      const pending = (queues.get(key) || Promise.resolve()).then(() => guarded(async () => {
        const decode = text => text == null ? null : JSON.parse(text);
        for (let attempt = 0; attempt < 4; attempt++) {
          const latest = cache.get(key) || { value: null, revision: 0 };
          const merged = method === 'DELETE' ? undefined : JSON.stringify(mergeRecords(decode(localValues.get(key)), decode(value), decode(latest.value)));
          try {
            const row = await request('/records/' + encodeURIComponent(key), { method, body: JSON.stringify({ value: merged, revision: revisions.get(key) || 0 }) });
            revisions.set(key, row.revision); cache.set(key, row);
            localValues.set(key, method === 'DELETE' ? null : value);
            return row;
          } catch (error) {
            if (error.status !== 409 || method === 'DELETE') throw error;
            const current = await request('/records/' + encodeURIComponent(key));
            revisions.set(key, current.revision); cache.set(key, current);
          }
        }
        throw new Error('The record is busy. Reload before editing again.');
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
  return <div style={{...panel, padding: 0}}><AccountLogin request={request} onLogin={connect} message={message} setMessage={setMessage}/></div>;
}
