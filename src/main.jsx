import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ServerGate } from './server-storage.jsx';

// Compatibility for the original artifact storage API. Data is browser-local.
window.storage = {
  async get(key) { const value = localStorage.getItem(`sentinel:${key}`); return value === null ? null : { key, value }; },
  async set(key, value) { localStorage.setItem(`sentinel:${key}`, value); return { key, value }; },
  async delete(key) { localStorage.removeItem(`sentinel:${key}`); return { key, deleted: true }; },
};
const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL;
if (publicAppUrl && import.meta.env.VITE_STORAGE_MODE !== 'server') {
  // Navigate to the full Pi-hosted app so login cookies and data stay same-origin.
  const target = new URL(publicAppUrl);
  if (target.protocol !== 'https:') throw new Error('The public app requires HTTPS.');
  createRoot(document.getElementById('root')).render(<main style={{ color: 'white', padding: 32, fontFamily: 'system-ui' }}><h1>Sentinel Weight Room</h1><p>Opening the shared weight room…</p><a style={{ color: '#e6c66c' }} href={target.href}>Open Sentinel</a></main>);
  window.location.replace(target.href);
} else {
  createRoot(document.getElementById('root')).render(import.meta.env.VITE_STORAGE_MODE === 'server' ? <ServerGate><App /></ServerGate> : <App />);
}
