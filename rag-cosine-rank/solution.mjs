export function rankByCosine(query, chunks, k) {
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const norm = (a) => Math.sqrt(dot(a, a));
  const cos = (a, b) => dot(a, b) / (norm(a) * norm(b));
  const scored = chunks.map((c) => ({ id: c.id, s: cos(query, c.vec) }));
  scored.sort((a, b) => b.s - a.s || (a.id < b.id ? -1 : 1));
  return scored.slice(0, k).map((x) => x.id);
}
