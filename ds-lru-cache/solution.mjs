export function lruProcess(capacity, ops) {
  const map = new Map();
  const out = [];
  for (const op of ops) {
    if (op[0] === 'put') {
      const [, k, v] = op;
      if (map.has(k)) map.delete(k);
      map.set(k, v);
      if (map.size > capacity) map.delete(map.keys().next().value);
    } else if (op[0] === 'get') {
      const [, k] = op;
      if (!map.has(k)) { out.push(-1); continue; }
      const v = map.get(k);
      map.delete(k); map.set(k, v);
      out.push(v);
    }
  }
  return out;
}
