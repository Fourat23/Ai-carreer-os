export function latestPerKey(rows) {
  const best = new Map();
  for (const r of rows) {
    const cur = best.get(r.key);
    if (!cur || r.version > cur.version) best.set(r.key, r);
  }
  return [...best.values()].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).map((r) => [r.key, r.value]);
}
