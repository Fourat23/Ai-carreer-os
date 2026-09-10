export function groupHaving(rows, minTotal) {
  const sums = new Map();
  for (const r of rows) sums.set(r.cat, (sums.get(r.cat) || 0) + r.amount);
  return [...sums.entries()].filter(([, s]) => s >= minTotal).map(([c, s]) => [c, s]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
