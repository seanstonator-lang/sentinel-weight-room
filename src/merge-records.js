const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keyed = value => Array.isArray(value) && value.every(item => object(item) && typeof item.id === 'string') && new Set(value.map(item => item.id)).size === value.length;

// Preserve other devices' independent changes. A true same-field collision stays
// a visible conflict; never guess which student's or coach's edit should win.
export function mergeRecords(base, local, remote) {
  if (same(local, base)) return remote;
  if (same(remote, base) || same(local, remote)) return local;
  if (base === null && object(local) && object(remote)) base = {};
  if (base === null && Array.isArray(local) && Array.isArray(remote)) base = [];
  if (object(base) && object(local) && object(remote)) {
    return Object.fromEntries([...new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])]
      .map(key => [key, mergeRecords(base[key], local[key], remote[key])]).filter(([, value]) => value !== undefined));
  }
  if (keyed(base) && keyed(local) && keyed(remote)) {
    const byId = list => new Map(list.map(item => [item.id, item]));
    const [b, l, r] = [base, local, remote].map(byId);
    return [...new Set([...remote.map(item => item.id), ...local.map(item => item.id), ...base.map(item => item.id)])]
      .map(id => mergeRecords(b.get(id), l.get(id), r.get(id))).filter(value => value !== undefined);
  }
  throw new Error('Another device edited the same field. Reload the server copy before entering your change again.');
}
