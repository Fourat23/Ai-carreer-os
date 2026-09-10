export function innerJoin(left, right, key) {
  const index = new Map(right.map((r) => [r[key], r]));
  const out = [];
  for (const l of left) {
    if (index.has(l[key])) out.push({ ...l, ...index.get(l[key]) });
  }
  return out;
}
