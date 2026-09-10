export function runningTotal(rows) {
  const indexed = rows.map((r, i) => ({ ...r, i }));
  const groups = new Map();
  for (const r of indexed) { if (!groups.has(r.group)) groups.set(r.group, []); groups.get(r.group).push(r); }
  const result = new Array(rows.length);
  for (const [, list] of groups) {
    list.sort((a, b) => a.seq - b.seq);
    let acc = 0;
    for (const r of list) { acc += r.amount; result[r.i] = acc; }
  }
  return result;
}
