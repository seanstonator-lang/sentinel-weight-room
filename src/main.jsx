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
createRoot(document.getElementById('root')).render(import.meta.env.VITE_STORAGE_MODE === 'server' ? <ServerGate><App /></ServerGate> : <App />);
