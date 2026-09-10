export function processRequests(reqs) {
  const seen = new Set();
  return reqs.map((r) => {
    if (r.key == null) return 'applied';
    if (seen.has(r.key)) return 'deduped';
    seen.add(r.key);
    return 'applied';
  });
}
